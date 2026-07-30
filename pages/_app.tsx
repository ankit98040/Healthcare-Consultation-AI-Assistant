import { ClerkProvider } from '@clerk/nextjs';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/globals.css';

// Fallback dummy key to prevent static pre-rendering failures during build if ENV is missing
const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>MediNotes Pro - AI Healthcare Consultation Assistant</title>
        <meta name="description" content="AI-powered healthcare consultation assistant for clinical summaries, action items, and patient emails." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} {...pageProps}>
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  );
}
