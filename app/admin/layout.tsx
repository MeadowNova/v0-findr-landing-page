import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Snagr AI',
  description: 'Admin dashboard for Snagr AI platform',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create Supabase server client
  const supabase = createServerClient();
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if user is authenticated
  if (!session) {
    redirect('/login?redirect=/admin');
  }
  
  // Get user data
  const { data: userData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  // Check if user is admin
  if (!userData || userData.role !== 'admin') {
    redirect('/');
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center">
            <div className="mr-4 flex">
              <a href="/" className="mr-6 flex items-center space-x-2">
                <span className="font-bold">Snagr AI</span>
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Admin</span>
              </a>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <a href="/admin" className="transition-colors hover:text-foreground/80">Dashboard</a>
                <a href="/admin/brightdata" className="transition-colors hover:text-foreground/80">Bright Data</a>
                <a href="/admin/users" className="transition-colors hover:text-foreground/80">Users</a>
                <a href="/admin/searches" className="transition-colors hover:text-foreground/80">Searches</a>
              </nav>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm mr-2">{session.user.email}</span>
                <form action="/api/v1/auth/logout" method="post">
                  <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
