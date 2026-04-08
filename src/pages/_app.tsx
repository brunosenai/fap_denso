import { Exo_2 } from 'next/font/google';
import Head from 'next/head';
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
        {/* Regra do Next.js: Viewport TEM que ficar aqui no _app */}
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <title>FAP App Centro 4.0</title>
        <meta name="description" content="Aplicativo FAP Stellantis" />
      </Head>
      
      <main className={exo2.className}>
        <Component {...pageProps} />
      </main>
    </>
  )
}