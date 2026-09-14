"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function sendPageView(pathname: string) {
  if (isAdminPath(pathname)) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", { page_path: pathname });
}

export function GoogleTag({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const ready = useRef(false);

  useEffect(() => {
    if (!ready.current) return;
    sendPageView(pathname);
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-gtag"
        strategy="afterInteractive"
        onReady={() => {
          ready.current = true;
          sendPageView(pathname);
        }}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
