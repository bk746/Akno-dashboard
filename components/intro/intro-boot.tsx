import Script from "next/script";

const introBootScript = `(function(){
  try {
    var root = document.documentElement;
    var path = window.location.pathname;
    if (path === '/login' || path.indexOf('/auth/') === 0) {
      root.classList.add('intro-complete');
      return;
    }
    if (
      sessionStorage.getItem('akno-dashboard-intro-seen') === '1' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      root.classList.add('intro-complete');
    }
    window.setTimeout(function () {
      root.classList.add('intro-complete');
    }, 4500);
  } catch (e) {
    document.documentElement.classList.add('intro-complete');
  }
})();`;

export function IntroBoot() {
  return (
    <Script id="akno-intro-boot" strategy="beforeInteractive">
      {introBootScript}
    </Script>
  );
}
