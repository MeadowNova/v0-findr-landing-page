import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms of Service | SnagrAI',
  description: 'Terms of Service for SnagrAI',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to SnagrAI. These Terms of Service govern your use of our website and services. 
          By accessing or using SnagrAI, you agree to be bound by these Terms.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Definitions</h2>
        <p>
          <strong>"Service"</strong> refers to the SnagrAI application, website, and any other related services.<br />
          <strong>"User"</strong> refers to individuals who register and use our Service.<br />
          <strong>"Content"</strong> refers to any information, text, graphics, or other materials uploaded, downloaded, or appearing on the Service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration</h2>
        <p>
          To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
        <p>
          You agree not to use the Service for any illegal purposes or to conduct any illegal activity. You agree not to access or attempt to access any other user's account. You agree not to interfere with or disrupt the Service or servers or networks connected to the Service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by SnagrAI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
        <p>
          In no event shall SnagrAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at support@snagrai.com.
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