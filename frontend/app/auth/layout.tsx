import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force no caching with headers
  const headersList = headers();
  
  return (
    <>
      {children}
    </>
  );
}
