import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="icon" href="/assets/icons/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16.png?v=2" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#243783" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FAP App" />
        
        {/* Ícone para a tela inicial do iOS. 
            NOTA: O ideal é ter um apple-touch-icon-180.png, mas se só tiver o de 192, pode deixar como abaixo: */}
        <link rel="apple-touch-icon" href="assets/icons/icon-192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}