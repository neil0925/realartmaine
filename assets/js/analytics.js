// Loads GA4 on production hosts only (keeps localhost console clean).
(function () {
  try {
    const MEASUREMENT_ID = "G-HZ2XXFNT02";
    const host = String(window.location && window.location.hostname ? window.location.hostname : "").toLowerCase();
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".localhost") ||
      host === "";

    if (isLocal) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);

    const s = document.createElement("script");
    s.async = true;
    s.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(s);
  } catch (e) {}
})();

