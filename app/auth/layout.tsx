import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 border-b">
        <Link href="/" className="flex items-center">
          <Image
            src="/placeholder-logo.svg"
            alt="SnagrAI Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-xl font-bold">SnagrAI</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} SnagrAI. All rights reserved.</p>
      </footer>
    </div>
  );
}