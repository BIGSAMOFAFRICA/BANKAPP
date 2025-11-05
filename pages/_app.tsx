import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import Navbar from '@/components/Navbar';
import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <div className={inter.className}>
        <Navbar />
        <Component {...pageProps} />
      </div>
    </ApolloProvider>
  );
}
