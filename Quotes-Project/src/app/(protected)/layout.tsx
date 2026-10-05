import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // 1. Kullanıcı oturumunu sadece BİR KERE çekiyoruz
  const session = await auth0.getSession();

  // 2. Eğer oturum yoksa (kullanıcı giriş yapmamışsa) Auth0 giriş sayfasına şutla!
  if (!session || !session.user) {
    redirect('/auth/login');
  }

  // 3. Kullanıcı giriş yapmışsa sorun yok, sayfayı (children) ekranda göster.
  return (
    <>
      {children}
    </>
  );
}