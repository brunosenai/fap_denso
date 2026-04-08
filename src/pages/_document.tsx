import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Vínculo com o arquivo do PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Cor da barra superior (Mudei de preto para o Azul Stellantis) */}
        <meta name="theme-color" content="#243783" />
        
        {/* Configurações ESSENCIAIS para instalar no iPad/iPhone (iOS) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FAP App" />
        
        {/* Ícone para a tela inicial do iOS. 
            NOTA: O ideal é ter um apple-touch-icon-180.png, mas se só tiver o de 192, pode deixar como abaixo: */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}