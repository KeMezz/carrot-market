// @ts-nocheck
import "@styles/globals.css";
import { SWRConfig } from "swr";
import type { AppProps } from "next/app";
import Script from "next/script";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{ fetcher: (url: string) => fetch(url).then((res) => res.json()) }}
    >
      <div className="w-full max-w-xl mx-auto">
        <Component {...pageProps} />
      </div>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-0ZT4MZR8PC"
        strategy="lazyOnload"
        onLoad={() => {
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }
          gtag("js", new Date());
          gtag("config", "G-0ZT4MZR8PC");
        }}
      />
    </SWRConfig>
  );
}

export default MyApp;
