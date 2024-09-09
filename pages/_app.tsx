import type { AppProps } from 'next/app';
import { AuthProviderAdmin } from '../contexts/AuthContextAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import '../styles/global.css';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  let Header = null;
  // let AuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  let AuthProvider = AuthProviderAdmin;

  if (router.pathname.startsWith('/admin')) {
    Header = HeaderAdmin;
  } else {
    // Header = HeaderMain;
    Header = HeaderAdmin;
  }

  return (
    <>
      <AuthProvider>
        {Header && <Header />}
        <main>
          <div className='inner'>
            <Component {...pageProps} />
          </div>
        </main>
      </AuthProvider>
    </>
  );
}
