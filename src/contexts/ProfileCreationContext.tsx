import { createContext, useContext, useState, ReactNode } from 'react';

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  locationCity?: string;
  locationCountry?: string;
  employmentType?: string;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
  sourceSnippet?: string;
  confidenceJson?: Record<string, number>;
  needsReview: boolean;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'document' | 'link';
  url?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}

interface ProfileCreationData {
  uploadedFileName?: string;
  uploadedFileSize?: number;
  uploadType?: 'resume' | 'linkedin_pdf';
  selectedCategory?: string;
  selectedCategoryName?: string;
  selectedSpecialties?: string[];
  selectedSpecialtyNames?: string[];
  selectedSkills?: string[];
  professionalTitle?: string;
  workExperiences?: WorkExperience[];
  educations?: Education[];
  languages?: Language[];
  portfolioItems?: PortfolioItem[];
  bio?: string;
  primaryLanguage?: string;
  location?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  userType?: string;
  profilePicture?: string;
  resumeId?: string;
  draftId?: string;
  parsingStatus?: 'idle' | 'processing' | 'complete' | 'failed';
}

interface ProfileCreationContextType {
  profileData: ProfileCreationData;
  updateProfileData: (data: Partial<ProfileCreationData>) => void;
  clearProfileData: () => void;
}

const ProfileCreationContext = createContext<ProfileCreationContextType | undefined>(undefined);

export function ProfileCreationProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileCreationData>(() => {
    // Initialize with data from localStorage if available
    if (typeof window !== 'undefined') {
      const tempProfile = localStorage.getItem('tempProfile');
      if (tempProfile) {
        try {
          const parsed = JSON.parse(tempProfile);
          return {
            primaryLanguage: parsed.primaryLanguage,
            location: parsed.location,
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            username: parsed.username,
            userType: parsed.userType,
            // Don't load complex arrays from localStorage to avoid stale data
          };
        } catch (err) {
          console.error('Error parsing tempProfile:', err);
        }
      }
    }
    return {};
  });

  const updateProfileData = (data: Partial<ProfileCreationData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const clearProfileData = () => {
    setProfileData({});
  };

  return (
    <ProfileCreationContext.Provider value={{ profileData, updateProfileData, clearProfileData }}>
      {children}
    </ProfileCreationContext.Provider>
  );
}

export function useProfileCreation() {
  const context = useContext(ProfileCreationContext);
  if (!context) {
    throw new Error('useProfileCreation must be used within ProfileCreationProvider');
  }
  return context;
}
