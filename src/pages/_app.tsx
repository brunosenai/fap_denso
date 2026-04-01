import { Exo_2 } from 'next/font/google';
import Head from 'next/head'; // <-- Importe o Head do Next.js
import "../styles/globals.css"
import type { AppProps } from "next/app";

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return(
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <title>FAP App</title>
        <meta name="description" content="Aplicativo FAP Stellantis" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      
      <main className={exo2.className}>
        <Component {...pageProps} />
      </main>
    </>
  )
}