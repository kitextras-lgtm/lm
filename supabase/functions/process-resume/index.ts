import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Helpers ───

async function updateResumeStatus(
  supabase: any,
  resumeId: string,
  status: string,
  errorCode?: string
) {
  const update: any = { status };
  if (errorCode) update.error_code = errorCode;
  await supabase.from('resumes').update(update).eq('id', resumeId);
}

function monthNameToNumber(name: string): number | null {
  const months: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  return months[name.toLowerCase().trim()] ?? null;
}

// ─── Text Extraction ───

async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<{ text: string; method: string }> {
  const bytes = new Uint8Array(fileBuffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawStr = decoder.decode(bytes);

  // Extract text between BT...ET blocks (PDF text objects)
  const textBlocks: string[] = [];
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  
  while ((match = btEtRegex.exec(rawStr)) !== null) {
    const block = match[1];
    
    // Extract text from Tj commands: (text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      let text = tjMatch[1];
      // Decode PDF escape sequences
      text = text.replace(/\\n/g, '\n')
                 .replace(/\\r/g, '\r')
                 .replace(/\\t/g, '\t')
                 .replace(/\\b/g, '\b')
                 .replace(/\\f/g, '\f')
                 .replace(/\\\(/g, '(')
                 .replace(/\\\)/g, ')')
                 .replace(/\\\\/g, '\\');
      textBlocks.push(text);
    }
    
    // Extract text from TJ commands: [(text1) num (text2)] TJ
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const items = tjArrMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(items)) !== null) {
        let text = strMatch[1];
        // Decode PDF escape sequences
        text = text.replace(/\\n/g, '\n')
                   .replace(/\\r/g, '\r')
                   .replace(/\\t/g, '\t')
                   .replace(/\\b/g, '\b')
                   .replace(/\\f/g, '\f')
                   .replace(/\\\(/g, '(')
                   .replace(/\\\)/g, ')')
                   .replace(/\\\\/g, '\\');
        textBlocks.push(text);
      }
    }
  }

  let extractedText = textBlocks.join(' ').replace(/\s+/g, ' ').trim();

  // If extraction failed or returned very little text, try alternative method
  if (!extractedText || extractedText.length < 100) {
    console.log('Primary extraction failed, trying alternative method...');
    
    // Look for text in stream objects
    const streamRegex = /stream\s+([\s\S]*?)\s+endstream/g;
    const streams: string[] = [];
    let streamMatch;
    
    while ((streamMatch = streamRegex.exec(rawStr)) !== null) {
      const streamContent = streamMatch[1];
      // Try to extract readable text from stream
      const readableText = streamContent.match(/[A-Za-z][A-Za-z0-9\s,.\-@()\/]{15,}/g);
      if (readableText) {
        streams.push(...readableText);
      }
    }
    
    if (streams.length > 0) {
      extractedText = streams.join('\n').trim();
    }
  }

  return { 
    text: extractedText || 'No text extracted', 
    method: extractedText.length > 100 ? 'PDF_TEXT' : 'OCR_FALLBACK' 
  };
}

async function extractTextFromDOCX(fileBuffer: ArrayBuffer): Promise<{ text: string; method: string }> {
  const bytes = new Uint8Array(fileBuffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawStr = decoder.decode(bytes);

  const textRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
  const texts: string[] = [];
  let match;
  while ((match = textRegex.exec(rawStr)) !== null) {
    texts.push(match[1]);
  }

  const extractedText = texts.join(' ').replace(/\s+/g, ' ').trim();
  return { text: extractedText || rawStr.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), method: 'DOCX_PARSE' };
}

// ─── Normalize Text ───

function normalizeText(text: string): string {
  return text
    .replace(/(\w)-\n(\w)/g, '$1$2')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ═══════════════════════════════════════════════════════════════
// ─── HEURISTIC RESUME PARSER (No AI) ───
// ═══════════════════════════════════════════════════════════════

// ─── Section Detection ───

interface Section {
  type: 'experience' | 'education' | 'skills' | 'certifications' | 'summary' | 'contact' | 'unknown';
  title: string;
  content: string;
  startLine: number;
}

const SECTION_PATTERNS: { type: Section['type']; patterns: RegExp[] }[] = [
  {
    type: 'experience',
    patterns: [
      /^(?:work\s+)?experience$/i,
      /^(?:professional|employment|work)\s+(?:experience|history)$/i,
      /^career\s+(?:history|summary)$/i,
      /^relevant\s+experience$/i,
      /^positions?\s+held$/i,
    ],
  },
  {
    type: 'education',
    patterns: [
      /^education$/i,
      /^education\s+(?:and\s+training|background|history)$/i,
      /^academic\s+(?:background|qualifications?)$/i,
      /^qualifications?$/i,
    ],
  },
  {
    type: 'skills',
    patterns: [
      /^(?:technical\s+)?skills$/i,
      /^skills?\s+(?:and\s+)?(?:abilities|competencies|expertise|proficiencies)$/i,
      /^core\s+(?:competencies|skills)$/i,
      /^areas?\s+of\s+expertise$/i,
      /^technologies$/i,
      /^tools?\s+(?:and\s+)?(?:technologies|frameworks)$/i,
    ],
  },
  {
    type: 'certifications',
    patterns: [
      /^certifications?$/i,
      /^certifications?\s+(?:and\s+)?(?:licenses?|accreditations?)$/i,
      /^licenses?\s+(?:and\s+)?certifications?$/i,
      /^professional\s+(?:certifications?|development)$/i,
    ],
  },
  {
    type: 'summary',
    patterns: [
      /^(?:professional\s+)?summary$/i,
      /^(?:career\s+)?objective$/i,
      /^about\s+me$/i,
      /^profile$/i,
      /^overview$/i,
    ],
  },
  {
    type: 'contact',
    patterns: [
      /^contact(?:\s+(?:info|information|details))?$/i,
      /^personal\s+(?:info|information|details)$/i,
    ],
  },
];

function detectSectionType(line: string): Section['type'] | null {
  const cleaned = line.replace(/[:\-–—|•*#_=]/g, '').trim();
  if (cleaned.length < 3 || cleaned.length > 60) return null;

  for (const { type, patterns } of SECTION_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) return type;
    }
  }
  return null;
}

function isSectionHeading(line: string, prevLine: string, nextLine: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 60) return false;

  // ALL CAPS heading
  const alphaOnly = trimmed.replace(/[^a-zA-Z\s]/g, '');
  if (alphaOnly.length > 3 && alphaOnly === alphaOnly.toUpperCase()) {
    if (detectSectionType(trimmed) !== null) return true;
  }

  // Followed by separator line
  if (/^[-=_]{3,}$/.test(nextLine?.trim() || '')) {
    if (detectSectionType(trimmed) !== null) return true;
  }

  // Short line that matches a section pattern
  if (detectSectionType(trimmed) !== null) return true;

  return false;
}

function splitIntoSections(text: string): Section[] {
  const lines = text.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let contentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

    if (isSectionHeading(line, prevLine, nextLine)) {
      // Save previous section
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
      }

      const sType = detectSectionType(line) || 'unknown';
      currentSection = {
        type: sType,
        title: line.trim(),
        content: '',
        startLine: i,
      };
      contentLines = [];
    } else {
      contentLines.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
  }

  // If no sections detected, treat entire text as one unknown section
  if (sections.length === 0 && text.trim().length > 0) {
    sections.push({
      type: 'unknown',
      title: '',
      content: text.trim(),
      startLine: 0,
    });
  }

  return sections;
}

// ─── Date Parsing ───

interface ParsedDate {
  month: number | null;
  year: number | null;
}

interface DateRange {
  start: ParsedDate;
  end: ParsedDate;
  isCurrent: boolean;
  confidence: number;
  matchedText: string;
}

const MONTH_PATTERN = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const YEAR_PATTERN = '(?:19|20)\\d{2}';
const CURRENT_PATTERN = '(?:Present|Current|Now|Ongoing|Today)';

function parseDateRange(text: string): DateRange | null {
  // Pattern: "Month Year – Month Year" or "Month Year – Present"
  const fullPattern = new RegExp(
    `(${MONTH_PATTERN})\\.?\\s*(${YEAR_PATTERN})\\s*[-–—to]+\\s*(?:(${MONTH_PATTERN})\\.?\\s*(${YEAR_PATTERN})|(${CURRENT_PATTERN}))`,
    'i'
  );
  let m = fullPattern.exec(text);
  if (m) {
    return {
      start: { month: monthNameToNumber(m[1]), year: parseInt(m[2]) },
      end: m[5]
        ? { month: null, year: null }
        : { month: monthNameToNumber(m[3]), year: parseInt(m[4]) },
      isCurrent: !!m[5],
      confidence: 0.95,
      matchedText: m[0],
    };
  }

  // Pattern: "Year – Year" or "Year – Present"
  const yearOnlyPattern = new RegExp(
    `(${YEAR_PATTERN})\\s*[-–—to]+\\s*(?:(${YEAR_PATTERN})|(${CURRENT_PATTERN}))`,
    'i'
  );
  m = yearOnlyPattern.exec(text);
  if (m) {
    return {
      start: { month: null, year: parseInt(m[1]) },
      end: m[3]
        ? { month: null, year: null }
        : { month: null, year: parseInt(m[2]) },
      isCurrent: !!m[3],
      confidence: 0.8,
      matchedText: m[0],
    };
  }

  // Pattern: "MM/YYYY – MM/YYYY"
  const slashPattern = /(\d{1,2})\/(\d{4})\s*[-–—to]+\s*(?:(\d{1,2})\/(\d{4})|(Present|Current|Now))/i;
  m = slashPattern.exec(text);
  if (m) {
    const sm = parseInt(m[1]);
    const sy = parseInt(m[2]);
    return {
      start: { month: sm >= 1 && sm <= 12 ? sm : null, year: sy },
      end: m[5]
        ? { month: null, year: null }
        : { month: parseInt(m[3]) >= 1 && parseInt(m[3]) <= 12 ? parseInt(m[3]) : null, year: parseInt(m[4]) },
      isCurrent: !!m[5],
      confidence: 0.9,
      matchedText: m[0],
    };
  }

  // Single year
  const singleYear = new RegExp(`(${YEAR_PATTERN})`, 'i');
  m = singleYear.exec(text);
  if (m) {
    return {
      start: { month: null, year: parseInt(m[1]) },
      end: { month: null, year: null },
      isCurrent: false,
      confidence: 0.4,
      matchedText: m[0],
    };
  }

  return null;
}

// ─── Employment Type Detection ───

function detectEmploymentType(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\b(?:full[\s-]?time)\b/.test(lower)) return 'Full-time';
  if (/\b(?:part[\s-]?time)\b/.test(lower)) return 'Part-time';
  if (/\b(?:contract(?:or)?|freelance|consulting)\b/.test(lower)) return 'Contract';
  if (/\b(?:intern(?:ship)?)\b/.test(lower)) return 'Internship';
  if (/\b(?:volunteer(?:ing)?)\b/.test(lower)) return 'Volunteer';
  if (/\b(?:temporary|temp)\b/.test(lower)) return 'Temporary';
  if (/\b(?:self[\s-]?employed)\b/.test(lower)) return 'Self-employed';
  return null;
}

// ─── Location Detection ───

function detectLocation(text: string): { city: string | null; country: string | null } {
  // Common patterns: "City, State" or "City, Country" or "Remote"
  if (/\bremote\b/i.test(text)) return { city: 'Remote', country: null };

  // "City, ST" (US state abbreviation)
  const usPattern = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z]{2})\b/;
  const usMatch = usPattern.exec(text);
  if (usMatch) return { city: usMatch[1], country: usMatch[2] };

  // "City, Country"
  const cityCountry = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/;
  const ccMatch = cityCountry.exec(text);
  if (ccMatch) return { city: ccMatch[1], country: ccMatch[2] };

  return { city: null, country: null };
}

// ─── Work Experience Parsing ───

interface ParsedWorkExperience {
  title: string;
  company: string;
  location_city: string | null;
  location_country: string | null;
  employment_type: string | null;
  start_month: number | null;
  start_year: number | null;
  end_month: number | null;
  end_year: number | null;
  is_current: boolean;
  description: string | null;
  source_snippet: string;
  confidence: {
    title: number;
    company: number;
    dates: number;
    description: number;
    location: number;
  };
}

function parseWorkExperienceSection(content: string): ParsedWorkExperience[] {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const jobs: ParsedWorkExperience[] = [];

  // Strategy: find lines with date ranges — these mark job entries
  // Then work backwards to find title/company
  const jobBlocks: { headerLines: string[]; bodyLines: string[]; dateRange: DateRange | null }[] = [];
  let currentBlock: { headerLines: string[]; bodyLines: string[]; dateRange: DateRange | null } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateRange = parseDateRange(line);

    // A date range on a line signals a new job entry
    if (dateRange && dateRange.confidence >= 0.4) {
      if (currentBlock) {
        jobBlocks.push(currentBlock);
      }

      // Look at previous lines (up to 3) for title/company
      const headerLines: string[] = [];
      const startIdx = Math.max(0, jobBlocks.length === 0 && i > 0 ? 0 : i - 2);
      for (let j = startIdx; j < i; j++) {
        const prevLine = lines[j];
        // Skip if it's a bullet point or description-like
        if (/^[•\-\*\u2022]/.test(prevLine)) continue;
        // Skip if it was already consumed by previous block
        if (currentBlock && jobBlocks.length > 0) {
          const lastBlockEnd = jobBlocks[jobBlocks.length - 1].bodyLines.length;
          if (j <= lastBlockEnd) continue;
        }
        headerLines.push(prevLine);
      }

      // Include the date line itself if it has more than just a date
      const lineWithoutDate = line.replace(dateRange.matchedText, '').trim();
      if (lineWithoutDate.length > 3) {
        headerLines.push(lineWithoutDate);
      }

      currentBlock = {
        headerLines,
        bodyLines: [],
        dateRange,
      };
    } else if (currentBlock) {
      currentBlock.bodyLines.push(line);
    } else {
      // Before first date — might be first job header
      if (!currentBlock) {
        currentBlock = { headerLines: [line], bodyLines: [], dateRange: null };
      }
    }
  }

  if (currentBlock) {
    jobBlocks.push(currentBlock);
  }

  // Parse each block into a job
  for (const block of jobBlocks) {
    const allHeaderText = block.headerLines.join(' ');
    const bodyText = block.bodyLines.join('\n');
    const snippet = [...block.headerLines, ...(block.dateRange ? [block.dateRange.matchedText] : []), ...block.bodyLines.slice(0, 3)].join('\n');

    // Extract title and company from header lines
    let title = '';
    let company = '';

    if (block.headerLines.length >= 2) {
      // Common patterns:
      // Line 1: Title
      // Line 2: Company
      // OR
      // Line 1: Company
      // Line 2: Title
      // OR
      // "Title at Company" or "Title | Company" or "Title, Company"

      const combinedLine = block.headerLines.join(' ');

      // Check for "at" or "|" or "–" separator
      const atPattern = /^(.+?)\s+(?:at|@)\s+(.+)$/i;
      const pipePattern = /^(.+?)\s*[|–—]\s*(.+)$/;

      const atMatch = atPattern.exec(combinedLine);
      const pipeMatch = pipePattern.exec(combinedLine);

      if (atMatch) {
        title = atMatch[1].trim();
        company = atMatch[2].trim();
      } else if (pipeMatch) {
        title = pipeMatch[1].trim();
        company = pipeMatch[2].trim();
      } else {
        // Assume first line is title, second is company
        title = block.headerLines[0];
        company = block.headerLines[1] || '';
      }
    } else if (block.headerLines.length === 1) {
      const line = block.headerLines[0];
      const atPattern = /^(.+?)\s+(?:at|@)\s+(.+)$/i;
      const pipePattern = /^(.+?)\s*[|–—]\s*(.+)$/;
      const atMatch = atPattern.exec(line);
      const pipeMatch = pipePattern.exec(line);

      if (atMatch) {
        title = atMatch[1].trim();
        company = atMatch[2].trim();
      } else if (pipeMatch) {
        title = pipeMatch[1].trim();
        company = pipeMatch[2].trim();
      } else {
        title = line;
        company = '';
      }
    }

    // Clean up title and company
    title = title.replace(/[,|–—]$/, '').trim();
    company = company.replace(/[,|–—]$/, '').trim();

    // Skip if we have nothing useful
    if (!title && !company) continue;

    // Extract description from body (bullet points and paragraphs)
    const descriptionLines = block.bodyLines.filter(l => {
      // Skip lines that look like dates or locations
      if (parseDateRange(l) && parseDateRange(l)!.confidence > 0.6) return false;
      return true;
    });
    const description = descriptionLines.join('\n').trim() || null;

    // Location
    const location = detectLocation(allHeaderText + ' ' + bodyText);

    // Employment type
    const empType = detectEmploymentType(allHeaderText + ' ' + bodyText);

    // Date range
    const dr = block.dateRange;

    // Confidence scoring
    const titleConf = title.length > 2 ? 0.85 : 0.3;
    const companyConf = company.length > 2 ? 0.85 : 0.3;
    const dateConf = dr ? dr.confidence : 0.0;
    const descConf = description && description.length > 20 ? 0.9 : description ? 0.6 : 0.0;
    const locConf = location.city ? 0.8 : 0.0;

    jobs.push({
      title: title || 'Untitled Role',
      company: company || 'Unknown Company',
      location_city: location.city,
      location_country: location.country,
      employment_type: empType,
      start_month: dr?.start.month ?? null,
      start_year: dr?.start.year ?? null,
      end_month: dr?.end.month ?? null,
      end_year: dr?.end.year ?? null,
      is_current: dr?.isCurrent ?? false,
      description,
      source_snippet: snippet.slice(0, 500),
      confidence: {
        title: titleConf,
        company: companyConf,
        dates: dateConf,
        description: descConf,
        location: locConf,
      },
    });
  }

  return jobs;
}

// ─── Education Parsing ───

interface ParsedEducation {
  school: string;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  confidence: { school: number; degree: number; dates: number };
}

const DEGREE_PATTERNS = [
  /\b(?:Bachelor(?:'s)?|B\.?[AS]\.?|B\.?Sc\.?|B\.?Eng\.?|B\.?Tech\.?|B\.?Com\.?|B\.?Ed\.?|BBA|BFA)\b/i,
  /\b(?:Master(?:'s)?|M\.?[AS]\.?|M\.?Sc\.?|M\.?Eng\.?|M\.?Tech\.?|MBA|MFA|M\.?Ed\.?|M\.?Phil\.?)\b/i,
  /\b(?:Doctor(?:ate)?|Ph\.?D\.?|D\.?Phil\.?|Ed\.?D\.?|M\.?D\.?|J\.?D\.?)\b/i,
  /\b(?:Associate(?:'s)?|A\.?[AS]\.?|A\.?A\.?S\.?)\b/i,
  /\b(?:Diploma|Certificate|Cert\.?)\b/i,
  /\b(?:High\s+School|GED|Secondary)\b/i,
];

function parseEducationSection(content: string): ParsedEducation[] {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const entries: ParsedEducation[] = [];
  let currentEntry: { lines: string[]; dateRange: DateRange | null } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateRange = parseDateRange(line);

    // Check if this line has a degree keyword or is a new entry
    const hasDegree = DEGREE_PATTERNS.some(p => p.test(line));
    const isNewEntry = hasDegree || (dateRange && dateRange.confidence >= 0.6);

    if (isNewEntry && currentEntry && currentEntry.lines.length > 0) {
      entries.push(processEducationEntry(currentEntry));
      currentEntry = { lines: [line], dateRange };
    } else if (!currentEntry) {
      currentEntry = { lines: [line], dateRange };
    } else {
      currentEntry.lines.push(line);
      if (dateRange && (!currentEntry.dateRange || dateRange.confidence > currentEntry.dateRange.confidence)) {
        currentEntry.dateRange = dateRange;
      }
    }
  }

  if (currentEntry && currentEntry.lines.length > 0) {
    entries.push(processEducationEntry(currentEntry));
  }

  return entries;
}

function processEducationEntry(entry: { lines: string[]; dateRange: DateRange | null }): ParsedEducation {
  const allText = entry.lines.join(' ');

  // Find degree
  let degree: string | null = null;
  for (const pattern of DEGREE_PATTERNS) {
    const m = pattern.exec(allText);
    if (m) {
      degree = m[0];
      break;
    }
  }

  // Find field of study — often after "in" or after degree
  let fieldOfStudy: string | null = null;
  const fieldPattern = /(?:in|of)\s+([A-Z][a-zA-Z\s&,]+?)(?:\s*[,\-–|]|\s*\d{4}|$)/;
  const fieldMatch = fieldPattern.exec(allText);
  if (fieldMatch) {
    fieldOfStudy = fieldMatch[1].trim();
    if (fieldOfStudy.length > 60) fieldOfStudy = fieldOfStudy.slice(0, 60);
  }

  // School name — usually the longest non-degree, non-date line
  let school = '';
  for (const line of entry.lines) {
    const cleaned = line.replace(entry.dateRange?.matchedText || '', '').trim();
    if (cleaned.length > school.length && !DEGREE_PATTERNS.some(p => p.test(cleaned))) {
      school = cleaned;
    }
  }
  if (!school) school = entry.lines[0] || 'Unknown School';

  // Clean school name
  school = school.replace(/[,\-–|]\s*$/, '').trim();

  const dr = entry.dateRange;

  return {
    school,
    degree,
    field_of_study: fieldOfStudy,
    start_year: dr?.start.year ?? null,
    end_year: dr?.end.year ?? dr?.start.year ?? null,
    confidence: {
      school: school.length > 3 ? 0.8 : 0.3,
      degree: degree ? 0.9 : 0.0,
      dates: dr ? dr.confidence : 0.0,
    },
  };
}

// ─── Skills Parsing ───

const SKILLS_DICTIONARY = new Set([
  // Programming
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
  'kotlin', 'php', 'scala', 'r', 'matlab', 'perl', 'dart', 'lua', 'haskell', 'elixir',
  // Web
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'react', 'angular', 'vue', 'svelte',
  'next.js', 'nuxt', 'gatsby', 'remix', 'astro', 'jquery', 'webpack', 'vite', 'babel',
  // Backend
  'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'laravel', '.net',
  'graphql', 'rest', 'grpc', 'websocket',
  // Database
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase',
  'supabase', 'sqlite', 'oracle', 'cassandra', 'neo4j',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd',
  'github actions', 'gitlab ci', 'linux', 'nginx', 'apache',
  // Design
  'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'after effects', 'premiere pro',
  'indesign', 'canva', 'blender', 'cinema 4d', 'ui/ux', 'wireframing', 'prototyping',
  // Data
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
  'data analysis', 'data visualization', 'tableau', 'power bi', 'excel', 'spss',
  // Mobile
  'react native', 'flutter', 'ios', 'android', 'xcode', 'android studio',
  // Marketing
  'seo', 'sem', 'google analytics', 'google ads', 'facebook ads', 'content marketing',
  'email marketing', 'social media marketing', 'copywriting', 'branding',
  // Video & Audio
  'video editing', 'audio editing', 'davinci resolve', 'final cut pro', 'logic pro',
  'pro tools', 'ableton', 'obs', 'streaming',
  // Project Management
  'agile', 'scrum', 'kanban', 'jira', 'trello', 'asana', 'notion', 'confluence',
  'project management', 'product management',
  // Soft Skills
  'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
  'time management', 'presentation', 'negotiation', 'mentoring',
  // Other
  'git', 'github', 'gitlab', 'bitbucket', 'api design', 'microservices', 'testing',
  'unit testing', 'e2e testing', 'cypress', 'jest', 'playwright', 'selenium',
]);

function parseSkillsSection(content: string): { name: string; confidence: number }[] {
  const skills: { name: string; confidence: number }[] = [];
  const seen = new Set<string>();

  // Split by common delimiters: commas, pipes, bullets, newlines
  const tokens = content
    .split(/[,|•\u2022\n\r;]/)
    .map(t => t.replace(/^[\s\-\*]+/, '').trim())
    .filter(t => t.length > 1 && t.length < 50);

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (seen.has(lower)) continue;

    // Check against dictionary
    if (SKILLS_DICTIONARY.has(lower)) {
      seen.add(lower);
      skills.push({ name: token, confidence: 0.95 });
    } else {
      // Check if any dictionary entry is contained in the token
      for (const dictSkill of SKILLS_DICTIONARY) {
        if (lower.includes(dictSkill) && !seen.has(dictSkill)) {
          seen.add(dictSkill);
          skills.push({ name: dictSkill, confidence: 0.7 });
        }
      }
      // If it's a short, clean token, add it with lower confidence
      if (!seen.has(lower) && /^[a-zA-Z][a-zA-Z0-9\s\/.#+\-]{1,30}$/.test(token)) {
        seen.add(lower);
        skills.push({ name: token, confidence: 0.5 });
      }
    }
  }

  return skills;
}

// ─── Certifications Parsing ───

interface ParsedCertification {
  name: string;
  issuer: string | null;
  issue_month: number | null;
  issue_year: number | null;
  confidence: { name: number; issuer: number };
}

function parseCertificationsSection(content: string): ParsedCertification[] {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const certs: ParsedCertification[] = [];

  for (const line of lines) {
    if (line.length < 3) continue;

    // Skip bullet markers
    const cleaned = line.replace(/^[•\-\*\u2022]\s*/, '').trim();
    if (cleaned.length < 3) continue;

    const dateRange = parseDateRange(cleaned);
    const nameWithoutDate = dateRange
      ? cleaned.replace(dateRange.matchedText, '').trim()
      : cleaned;

    // Try to split "Cert Name – Issuer" or "Cert Name, Issuer"
    let name = nameWithoutDate;
    let issuer: string | null = null;

    const sepMatch = /^(.+?)\s*[–—|,]\s*(.+)$/.exec(nameWithoutDate);
    if (sepMatch) {
      name = sepMatch[1].trim();
      issuer = sepMatch[2].trim();
    }

    if (name.length < 3) continue;

    certs.push({
      name,
      issuer,
      issue_month: dateRange?.start.month ?? null,
      issue_year: dateRange?.start.year ?? null,
      confidence: {
        name: name.length > 5 ? 0.85 : 0.5,
        issuer: issuer ? 0.7 : 0.0,
      },
    });
  }

  return certs;
}

// ─── Full-text Skill Extraction (fallback) ───

function extractSkillsFromFullText(text: string): { name: string; confidence: number }[] {
  const skills: { name: string; confidence: number }[] = [];
  const seen = new Set<string>();
  const lower = text.toLowerCase();

  for (const skill of SKILLS_DICTIONARY) {
    if (seen.has(skill)) continue;
    // Word boundary check
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      seen.add(skill);
      skills.push({ name: skill, confidence: 0.6 });
    }
  }

  return skills;
}

// ─── Needs Review Logic ───

function computeNeedsReview(entry: ParsedWorkExperience): boolean {
  if (entry.title === 'Untitled Role' || entry.company === 'Unknown Company') return true;
  if (!entry.start_year && !entry.is_current) return true;
  if (!entry.end_year && !entry.is_current) return true;
  if (entry.confidence.title < 0.65) return true;
  if (entry.confidence.company < 0.65) return true;
  if (entry.confidence.dates < 0.60) return true;
  return false;
}

// ─── Main Heuristic Parser ───

function parseResumeHeuristic(text: string): {
  work_experience: ParsedWorkExperience[];
  education: ParsedEducation[];
  certifications: ParsedCertification[];
  skills: { name: string; confidence: number }[];
} {
  const sections = splitIntoSections(text);

  let workExperiences: ParsedWorkExperience[] = [];
  let educations: ParsedEducation[] = [];
  let certifications: ParsedCertification[] = [];
  let skills: { name: string; confidence: number }[] = [];

  for (const section of sections) {
    switch (section.type) {
      case 'experience':
        workExperiences = [...workExperiences, ...parseWorkExperienceSection(section.content)];
        break;
      case 'education':
        educations = [...educations, ...parseEducationSection(section.content)];
        break;
      case 'skills':
        skills = [...skills, ...parseSkillsSection(section.content)];
        break;
      case 'certifications':
        certifications = [...certifications, ...parseCertificationsSection(section.content)];
        break;
      case 'unknown':
        // Try to extract work experiences from unstructured text
        if (workExperiences.length === 0) {
          workExperiences = parseWorkExperienceSection(section.content);
        }
        break;
    }
  }

  // Fallback: extract skills from full text if none found in dedicated section
  if (skills.length === 0) {
    skills = extractSkillsFromFullText(text);
  }

  return { work_experience: workExperiences, education: educations, certifications, skills };
}

// ═══════════════════════════════════════════════════════════════
// ─── Main Handler ───
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { resumeId, userId } = await req.json();

    if (!resumeId || !userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing resumeId or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Stage 0: Load & Validate ───
    const { data: resume, error: resumeErr } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (resumeErr || !resume) {
      return new Response(
        JSON.stringify({ success: false, message: 'Resume not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await updateResumeStatus(supabase, resumeId, 'SCANNING');

    // ─── Stage 1: Download file ───
    const { data: fileData, error: fileErr } = await supabase.storage
      .from('profile-uploads')
      .download(resume.file_key);

    if (fileErr || !fileData) {
      await updateResumeStatus(supabase, resumeId, 'FAILED', 'FILE_NOT_FOUND');
      return new Response(
        JSON.stringify({ success: false, message: 'File not found in storage' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Stage 2: Text Extraction ───
    await updateResumeStatus(supabase, resumeId, 'EXTRACTING');

    const fileBuffer = await fileData.arrayBuffer();
    let extraction: { text: string; method: string };

    if (resume.mime_type === 'application/pdf') {
      extraction = await extractTextFromPDF(fileBuffer);
    } else if (
      resume.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      resume.mime_type === 'application/msword'
    ) {
      extraction = await extractTextFromDOCX(fileBuffer);
    } else {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      extraction = { text: decoder.decode(fileBuffer), method: 'TEXT' };
    }

    // ─── Stage 3: Normalize ───
    const normalizedText = normalizeText(extraction.text);

    // Store artifact
    await supabase.from('resume_artifacts').insert({
      resume_id: resumeId,
      extracted_text: normalizedText,
      extraction_method: extraction.method,
      parser_version: '2.0.0-heuristic',
    });

    // ─── Stage 4: Heuristic Parse (No AI) ───
    await updateResumeStatus(supabase, resumeId, 'PARSING');

    const parsed = parseResumeHeuristic(normalizedText);

    // Store parsed output
    await supabase.from('resume_artifacts').update({
      raw_llm_output_json: parsed,
    }).eq('resume_id', resumeId);

    // ─── Stage 5: Validate & Post-process ───
    const workExperiences = parsed.work_experience.map((entry, idx) => ({
      title: entry.title,
      company: entry.company,
      location_city: entry.location_city,
      location_country: entry.location_country,
      employment_type: entry.employment_type,
      start_month: entry.start_month,
      start_year: entry.start_year,
      end_month: entry.end_month,
      end_year: entry.end_year,
      is_current: entry.is_current,
      description: entry.description,
      source_snippet: entry.source_snippet,
      confidence_json: entry.confidence,
      needs_review: computeNeedsReview(entry),
      sort_order: idx,
    }));

    const educations = parsed.education.map((entry, idx) => ({
      school: entry.school,
      degree: entry.degree,
      field_of_study: entry.field_of_study,
      start_year: entry.start_year,
      end_year: entry.end_year,
      confidence_json: entry.confidence,
      needs_review: entry.school === 'Unknown School' || entry.confidence.school < 0.65,
      sort_order: idx,
    }));

    const certifications = parsed.certifications.map((entry, idx) => ({
      name: entry.name,
      issuer: entry.issuer,
      issue_month: entry.issue_month,
      issue_year: entry.issue_year,
      confidence_json: entry.confidence,
      needs_review: entry.confidence.name < 0.65,
      sort_order: idx,
    }));

    const skills = parsed.skills.map((entry) => ({
      skill_name: entry.name,
      proficiency: null,
      confidence: entry.confidence,
      source: 'RESUME',
    }));

    // ─── Stage 6: Write to ProfileDraft ───

    let draftId: string;
    const { data: existingDraft } = await supabase
      .from('profile_drafts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'DRAFT')
      .single();

    if (existingDraft) {
      draftId = existingDraft.id;
      await Promise.all([
        supabase.from('draft_work_experiences').delete().eq('draft_id', draftId),
        supabase.from('draft_educations').delete().eq('draft_id', draftId),
        supabase.from('draft_certifications').delete().eq('draft_id', draftId),
        supabase.from('draft_publications').delete().eq('draft_id', draftId),
        supabase.from('draft_community_roles').delete().eq('draft_id', draftId),
        supabase.from('draft_skills').delete().eq('draft_id', draftId),
      ]);
      await supabase.from('profile_drafts').update({
        source_resume_id: resumeId,
        status: 'READY_FOR_REVIEW',
      }).eq('id', draftId);
    } else {
      const { data: newDraft, error: draftErr } = await supabase
        .from('profile_drafts')
        .insert({
          user_id: userId,
          source_resume_id: resumeId,
          status: 'READY_FOR_REVIEW',
        })
        .select('id')
        .single();

      if (draftErr || !newDraft) {
        await updateResumeStatus(supabase, resumeId, 'FAILED', 'DRAFT_CREATE_FAILED');
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to create profile draft' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      draftId = newDraft.id;
    }

    // Insert entities
    const insertPromises: Promise<any>[] = [];

    if (workExperiences.length > 0) {
      insertPromises.push(
        supabase.from('draft_work_experiences').insert(
          workExperiences.map((w) => ({ ...w, draft_id: draftId }))
        )
      );
    }

    if (educations.length > 0) {
      insertPromises.push(
        supabase.from('draft_educations').insert(
          educations.map((e) => ({ ...e, draft_id: draftId }))
        )
      );
    }

    if (certifications.length > 0) {
      insertPromises.push(
        supabase.from('draft_certifications').insert(
          certifications.map((c) => ({ ...c, draft_id: draftId }))
        )
      );
    }

    if (skills.length > 0) {
      insertPromises.push(
        supabase.from('draft_skills').insert(
          skills.map((s) => ({ ...s, draft_id: draftId }))
        )
      );
    }

    await Promise.all(insertPromises);

    // Mark resume as complete
    await updateResumeStatus(supabase, resumeId, 'COMPLETE');

    return new Response(
      JSON.stringify({
        success: true,
        draftId,
        resumeId,
        parserVersion: '2.0.0-heuristic',
        summary: {
          workExperiences: workExperiences.length,
          educations: educations.length,
          certifications: certifications.length,
          skills: skills.length,
          needsReview: workExperiences.filter((w) => w.needs_review).length,
          extractionMethod: extraction.method,
          textLength: normalizedText.length,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('❌ process-resume error:', err);
    return new Response(
      JSON.stringify({ success: false, message: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
