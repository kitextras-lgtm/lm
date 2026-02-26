import { useEffect } from 'react';
import { Header } from '../components/Header';

export function TermsOfServicePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-black min-h-screen text-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Terms of Service</h1>
        <p className="text-neutral-400 text-center mb-16">Last updated: February 25, 2026</p>

        <div className="space-y-12 text-neutral-300 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Elevate platform ("Platform"), operated at sayelevate.com and its
              associated services, you ("User," "you," or "your") agree to be bound by these Terms of
              Service ("Terms"). If you do not agree to these Terms, you must not access or use the
              Platform.
            </p>
            <p className="mt-3">
              These Terms constitute a legally binding agreement between you and Elevate ("Elevate," "we,"
              "us," or "our"). We reserve the right to modify these Terms at any time. Continued use of the
              Platform after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old, or the age of majority in your jurisdiction, to create an
              account and use the Platform. By registering, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
              <li>You meet the minimum age requirement.</li>
              <li>The information you provide during registration is accurate and complete.</li>
              <li>You will maintain the accuracy of your account information.</li>
              <li>Your use of the Platform does not violate any applicable law or regulation.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Account Registration and Security</h2>
            <p>
              To access most features, you must create an account by providing a valid email address. We
              use a one-time password (OTP) verification system delivered via email for authentication. You
              are responsible for:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
              <li>Maintaining the confidentiality of your account credentials and OTP codes.</li>
              <li>All activities that occur under your account.</li>
              <li>Notifying us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms, exhibit
              fraudulent activity, or remain inactive for an extended period.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Platform Services</h2>
            <p>
              Elevate is a professional ecosystem that connects artists, content creators, freelancers, and
              brands. Depending on your account type, the Platform provides:
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">4.1 For Artists</h3>
            <p>
              Profile creation and management, social link verification, content licensing tools, campaign
              management, and application-based approval for artist accounts.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">4.2 For Content Creators</h3>
            <p>
              Dashboard tools for managing social links, channel management, content analytics, and
              platform-curated opportunities.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">4.3 For Freelancers</h3>
            <p>
              Comprehensive profile building including professional experience, education, skills, portfolio,
              rate setting, resume uploads and processing, and access to freelance opportunities.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">4.4 For Brands and Businesses</h3>
            <p>
              Campaign creation and management tools, deal facilitation, and access to the Elevate talent
              network of verified artists, creators, and freelancers.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">4.5 Messaging</h3>
            <p>
              In-platform messaging for communication between users and the Elevate support team.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">4.6 Announcements and Notifications</h3>
            <p>
              Email and in-platform notifications about new features, platform updates, and relevant
              opportunities. You may manage your notification preferences in your account settings.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. User Content</h2>
            <p>
              "User Content" includes all information, data, text, images, resumes, social links, profile
              pictures, banners, portfolio items, and any other material you submit to the Platform.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">5.1 Ownership</h3>
            <p>
              You retain ownership of your User Content. By submitting content to the Platform, you grant
              Elevate a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and
              distribute your content solely for the purpose of operating, improving, and promoting the
              Platform.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">5.2 Content Responsibilities</h3>
            <p>You represent and warrant that:</p>
            <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
              <li>You own or have the necessary rights to submit your User Content.</li>
              <li>Your content does not infringe on any third-party intellectual property rights.</li>
              <li>Your content is not false, misleading, defamatory, or otherwise harmful.</li>
              <li>Your content complies with all applicable laws and regulations.</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">5.3 Content Licensing (Artists)</h3>
            <p>
              If you submit content through the Licensing Application, you agree to the additional terms
              presented during the licensing submission process, including representations of ownership,
              authorization for distribution, and cooperation with platform audits and takedown requests.
            </p>

            <h3 className="text-lg font-medium text-white mt-5 mb-2">5.4 Content Moderation</h3>
            <p>
              We reserve the right to review, remove, or restrict access to any User Content that violates
              these Terms or is otherwise objectionable, without prior notice.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Social Link Verification</h2>
            <p>
              The Platform provides a social link verification system where users can prove ownership of
              external profiles by placing a unique verification phrase on their linked pages. Verified links
              are exclusively owned — each URL may be claimed by only one account. Submitting false
              verification claims may result in account suspension.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Resume and Document Uploads</h2>
            <p>
              The Platform allows users to upload resumes and professional documents (PDF, DOCX, DOC,
              RTF formats, up to 5MB). Uploaded files are validated for type and integrity. By uploading
              documents, you confirm that:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
              <li>The documents contain accurate and truthful information.</li>
              <li>You have the right to share the information contained in the documents.</li>
              <li>The documents do not contain malware, viruses, or malicious content.</li>
            </ul>
            <p className="mt-3">
              Uploaded documents may be processed to extract professional information for profile
              building. This processing is performed server-side using heuristic analysis without third-party
              AI services.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Use the Platform for any illegal or unauthorized purpose.</li>
              <li>Impersonate any person or entity, or falsely represent your affiliation.</li>
              <li>Submit false, misleading, or fraudulent information.</li>
              <li>Attempt to gain unauthorized access to other accounts or Platform systems.</li>
              <li>Interfere with or disrupt the Platform or its infrastructure.</li>
              <li>Use automated systems (bots, scrapers, crawlers) to access the Platform without our written consent.</li>
              <li>Engage in harassment, abuse, or any conduct that is harmful to other users.</li>
              <li>Circumvent any rate limits, security measures, or access controls.</li>
              <li>Upload content that contains viruses, malware, or any other harmful code.</li>
              <li>Use the Platform to distribute spam or unsolicited communications.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Intellectual Property</h2>
            <p>
              The Platform, including its design, features, code, logos, graphics, and all associated
              intellectual property, is owned by Elevate and protected by copyright, trademark, and other
              intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the
              Platform without our prior written consent.
            </p>
            <p className="mt-3">
              The name "Elevate," the Elevate logo, and all related names, logos, product and service names,
              designs, and slogans are trademarks of Elevate. You may not use such marks without our prior
              written permission.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Third-Party Services</h2>
            <p>
              The Platform integrates with third-party services for email delivery, data storage, and
              authentication. Your use of these services is subject to their respective terms and privacy
              policies. Elevate is not responsible for the practices, content, or availability of third-party
              services.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Deal Facilitation</h2>
            <p>
              Elevate serves as a neutral third-party facilitator for hiring, sponsorships, partnerships, and
              strategic deals between users. We ensure agreements are executed through structured deal
              management. However:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
              <li>Elevate is not a party to agreements between users.</li>
              <li>We do not guarantee the quality, legality, or fulfillment of any deal.</li>
              <li>Disputes between users should be resolved directly between the involved parties.</li>
              <li>Elevate may, at its sole discretion, provide mediation assistance.</li>
            </ul>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Privacy and Data Collection</h2>
            <p>
              Your privacy is important to us. By using the Platform, you acknowledge that we collect and
              process the following types of data:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
              <li>Account information (email address, name, username, location, language preference).</li>
              <li>Profile data (profile pictures, banners, bio, user type, social links).</li>
              <li>Professional information (work experience, education, skills, portfolio, rates).</li>
              <li>Uploaded documents (resumes, LinkedIn PDFs).</li>
              <li>Usage data (IP addresses, user agent, session activity) for security and rate limiting.</li>
              <li>Communication data (in-platform messages).</li>
            </ul>
            <p className="mt-3">
              We use this data to operate the Platform, verify identities, prevent fraud, send notifications,
              and improve our services. We do not sell your personal data to third parties.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">13. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ELEVATE AND ITS OFFICERS, DIRECTORS,
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
              DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
            </p>
            <p className="mt-3">
              THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES
              OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">14. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Elevate and its affiliates, officers,
              directors, employees, and agents from and against any claims, liabilities, damages, losses,
              costs, or expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
              <li>Your use of the Platform.</li>
              <li>Your violation of these Terms.</li>
              <li>Your User Content.</li>
              <li>Your violation of any rights of a third party.</li>
            </ul>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">15. Account Termination</h2>
            <p>
              We may suspend or terminate your account at any time, with or without cause and with or
              without notice, if we determine that you have violated these Terms, engaged in fraudulent or
              abusive behavior, or for any other reason at our sole discretion.
            </p>
            <p className="mt-3">
              Upon termination, your right to use the Platform ceases immediately. We may retain certain
              data as required by law or for legitimate business purposes. You may request deletion of your
              account and associated data by contacting us at hello@sayelevate.com.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">16. Dispute Resolution</h2>
            <p>
              Any dispute arising out of or relating to these Terms or your use of the Platform shall first be
              attempted to be resolved through good-faith negotiation. If a dispute cannot be resolved
              through negotiation within thirty (30) days, either party may pursue binding arbitration or
              other legal remedies as permitted under applicable law.
            </p>
          </section>

          {/* 17 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">17. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which Elevate operates, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* 18 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">18. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be
              modified to the minimum extent necessary to make it enforceable, or if modification is not
              possible, severed from these Terms. The remaining provisions shall continue in full force and
              effect.
            </p>
          </section>

          {/* 19 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">19. Entire Agreement</h2>
            <p>
              These Terms, together with any additional terms you agree to when using specific Platform
              features (such as licensing agreements), constitute the entire agreement between you and
              Elevate regarding the use of the Platform.
            </p>
          </section>

          {/* 20 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">20. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-3">
              <strong className="text-white">Elevate</strong><br />
              Email: <a href="mailto:hello@sayelevate.com" className="text-white underline hover:text-neutral-300 transition-colors">hello@sayelevate.com</a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <div className="py-8 md:py-10 border-t border-white/5">
        <p className="text-neutral-500 text-xs md:text-sm text-center tracking-wide">
          &copy; {new Date().getFullYear()} Elevate. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
