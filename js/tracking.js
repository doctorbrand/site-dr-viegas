/* Rastreamento do site Dr. Viégas
   - Guarda a origem da visita (UTMs, gclid, fbclid, referência) na primeira e na última visita.
   - Registra todo clique em link e botão: dataLayer (GTM/GA4), Meta Pixel e planilha.
   - Registra profundidade de rolagem (25, 50, 75, 100%).
   - Expõe VG.lead() para a página de obrigado. */
(function () {
  var C = window.VG_CONFIG || {};
  window.dataLayer = window.dataLayer || [];

  /* ---------- armazenamento seguro ---------- */
  function get(store, k) { try { return JSON.parse(window[store].getItem(k)); } catch (e) { return null; } }
  function set(store, k, v) { try { window[store].setItem(k, JSON.stringify(v)); } catch (e) {} }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ---------- origem da visita ---------- */
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid"];
  var qs = new URLSearchParams(location.search);
  var touch = {};
  KEYS.forEach(function (k) { if (qs.get(k)) touch[k] = qs.get(k); });
  var isNewTouch = Object.keys(touch).length > 0 || (document.referrer && document.referrer.indexOf(location.hostname) === -1);
  if (isNewTouch) {
    touch.landing = location.pathname + location.search;
    touch.referrer = document.referrer || "";
    touch.at = new Date().toISOString();
    if (!get("localStorage", "vg_first")) set("localStorage", "vg_first", touch);
    set("localStorage", "vg_last", touch);
  }
  var visitor = get("localStorage", "vg_vid") || uid(); set("localStorage", "vg_vid", visitor);
  var session = get("sessionStorage", "vg_sid") || uid(); set("sessionStorage", "vg_sid", session);

  function attribution() {
    var last = get("localStorage", "vg_last") || {}, first = get("localStorage", "vg_first") || {};
    return {
      visitor_id: visitor, session_id: session,
      utm_source: last.utm_source || "", utm_medium: last.utm_medium || "", utm_campaign: last.utm_campaign || "",
      utm_term: last.utm_term || "", utm_content: last.utm_content || "",
      gclid: last.gclid || last.gbraid || last.wbraid || "", fbclid: last.fbclid || "",
      landing: last.landing || "", referrer: last.referrer || "",
      first_source: first.utm_source || (first.referrer ? new URL(first.referrer).hostname : "direto"),
      device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "celular" : "desktop"
    };
  }

  /* ---------- tags ---------- */
  if (C.gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var g = document.createElement("script"); g.async = true;
    g.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(C.gtmId);
    document.head.appendChild(g);
  }
  if (C.ga4Id && !C.gtmId) {
    var ga = document.createElement("script"); ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.ga4Id);
    document.head.appendChild(ga);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", C.ga4Id);
  }
  if (C.metaPixelId && !C.gtmId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", C.metaPixelId); window.fbq("track", "PageView");
  }

  /* ---------- envio para a planilha ---------- */
  function toSheet(payload) {
    if (!C.sheetEndpoint) return;
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(C.sheetEndpoint, new Blob([body], { type: "text/plain" }))) return;
    } catch (e) {}
    try { fetch(C.sheetEndpoint, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain" }, body: body }); } catch (e) {}
  }

  /* ---------- cliques ---------- */
  function clickType(href) {
    if (!href) return "botao";
    if (href.indexOf("/obrigado") > -1 || href.indexOf("wa.me") > -1) return "whatsapp";
    if (href.indexOf("instagram.com") > -1) return "instagram";
    if (href.indexOf("youtube.com") > -1) return "youtube";
    if (href.indexOf("google.com/maps") > -1) return "google";
    if (href.indexOf("mailto:") === 0) return "email";
    if (href.indexOf("tel:") === 0) return "telefone";
    if (href.charAt(0) === "#") return "navegacao";
    return "link";
  }
  function label(el) {
    return (el.getAttribute("data-track") || el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
  }
  function section(el) {
    var s = el.closest("section[id], header, footer, nav");
    if (!s) return "pagina";
    return s.id || s.tagName.toLowerCase();
  }
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("a, button, summary, [data-track]");
    if (!el) return;
    var href = el.getAttribute("href") || "";
    var d = {
      tipo: "clique", botao: label(el), secao: section(el), destino: href.slice(0, 200),
      categoria: clickType(href), pagina: location.pathname, quando: new Date().toISOString()
    };
    window.dataLayer.push({ event: "vg_click", click_label: d.botao, click_section: d.secao, click_type: d.categoria, click_url: d.destino });
    if (window.gtag && C.ga4Id && !C.gtmId) window.gtag("event", "vg_click", { click_label: d.botao, click_section: d.secao, click_type: d.categoria });
    if (window.fbq && C.metaPixelId && !C.gtmId) window.fbq("trackCustom", "Clique", { botao: d.botao, secao: d.secao });
    var a = attribution(); for (var k in a) d[k] = a[k];
    toSheet(d);
  }, true);

  /* ---------- rolagem ---------- */
  var marks = [25, 50, 75, 100], hit = {};
  addEventListener("scroll", function () {
    var h = document.documentElement, p = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
    marks.forEach(function (m) { if (p >= m && !hit[m]) { hit[m] = 1; window.dataLayer.push({ event: "vg_scroll", percent: m }); } });
  }, { passive: true });

  /* ---------- lead (usado em /obrigado) ---------- */
  window.VG = {
    attribution: attribution,
    lead: function (origem) {
      var a = attribution(), id = uid();
      window.dataLayer.push({ event: "generate_lead", lead_id: id, lead_origin: origem, lead_channel: "whatsapp", utm_source: a.utm_source, utm_campaign: a.utm_campaign });
      if (window.gtag && C.ga4Id && !C.gtmId) window.gtag("event", "generate_lead", { lead_origin: origem, method: "whatsapp" });
      if (window.fbq && C.metaPixelId && !C.gtmId) window.fbq("track", "Contact", { content_name: origem }, { eventID: id });
      var d = { tipo: "lead", lead_id: id, botao: origem, secao: origem, categoria: "whatsapp", pagina: "/obrigado", quando: new Date().toISOString() };
      for (var k in a) d[k] = a[k];
      toSheet(d);
      return id;
    },
    whatsappUrl: function (origem) {
      var msg = (C.whatsappMessage || "") ;
      return "https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent(msg);
    }
  };
})();
