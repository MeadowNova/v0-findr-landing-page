import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy | SnagrAI',
  description: 'Privacy Policy for SnagrAI',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          At SnagrAI, we respect your privacy and are committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p>
          We collect several types of information from and about users of our Service, including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Personal identifiers such as name and email address</li>
          <li>Account credentials</li>
          <li>Usage data and activity on our platform</li>
          <li>Device and connection information</li>
          <li>Search queries and preferences</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>
          We use the information we collect about you for various purposes, including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Providing, maintaining, and improving our Service</li>
          <li>Processing your transactions</li>
          <li>Sending you notifications related to your account</li>
          <li>Responding to your inquiries and providing customer support</li>
          <li>Analyzing usage patterns to enhance user experience</li>
          <li>Protecting against unauthorized access and fraud</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. 
          However, no method of transmission over the Internet or electronic storage is 100% secure, 
          and we cannot guarantee absolute security.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Third-Party Services</h2>
        <p>
          Our Service may contain links to third-party websites or services that are not owned or controlled by SnagrAI. 
          We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Children's Privacy</h2>
        <p>
          Our Service is not intended for use by children under the age of 13. 
          We do not knowingly collect personally identifiable information from children under 13. 
          If we discover that a child under 13 has provided us with personal information, we will delete it immediately.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Data Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your personal data, including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>The right to access your personal data</li>
          <li>The right to correct inaccurate data</li>
          <li>The right to request deletion of your data</li>
          <li>The right to restrict or object to our processing of your data</li>
          <li>The right to data portability</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@snagrai.com.
        </p>
      </div>
      
      <div className="mt-10 flex justify-center">
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}