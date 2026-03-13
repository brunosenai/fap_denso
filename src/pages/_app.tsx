import { Exo_2 } from 'next/font/google';
//import "@/styles/globals.css";
import "../styles/globals.css"
import type { AppProps } from "next/app";

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Escolha os pesos que desejar
});

export default function App({ Component, pageProps }: AppProps) {
  return(
    <main className={exo2.className}>
      <Component {...pageProps} />;
    </main>
  )
}
