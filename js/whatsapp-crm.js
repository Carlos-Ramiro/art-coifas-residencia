(function () {
  const AC_CFG = {
    WA_PHONE_E164: "551932131636",
    CRM_AJAX_URL: "https://app-calhas.topesite.com.br/wp-admin/admin-ajax.php",
    EMPRESA_PROJETO: "art_coifas",
    MODELO_VENDA_PADRAO: "a_definir",
    GCLID_KEY: "ac_gclid_v1",
    GCLID_TS_KEY: "ac_gclid_ts_v1",
    GCLID_TTL_DAYS: 90
  };

  function getUrlParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name);
    } catch (e) {
      return null;
    }
  }

  function nowMs() {
    return Date.now();
  }

  function daysToMs(d) {
    return d * 24 * 60 * 60 * 1000;
  }

  function storeGclidFromUrl() {
    const gclid = getUrlParam("gclid");
    if (gclid && gclid.trim()) {
      localStorage.setItem(AC_CFG.GCLID_KEY, gclid.trim());
      localStorage.setItem(AC_CFG.GCLID_TS_KEY, String(nowMs()));
    }
  }

  function readGclid() {
    const g = (localStorage.getItem(AC_CFG.GCLID_KEY) || "").trim();
    const ts = parseInt(localStorage.getItem(AC_CFG.GCLID_TS_KEY) || "0", 10);

    if (!g) return "";
    if (!ts) return g;

    return (nowMs() - ts) <= daysToMs(AC_CFG.GCLID_TTL_DAYS) ? g : "";
  }

  function makeEventId() {
    const rnd = Math.random().toString(16).slice(2);
    return "evt_" + Date.now() + "_" + rnd;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatLocalDateTime() {
    const d = new Date();
    return [
      d.getFullYear(), "-", pad2(d.getMonth() + 1), "-", pad2(d.getDate()),
      " ",
      pad2(d.getHours()), ":", pad2(d.getMinutes()), ":", pad2(d.getSeconds())
    ].join("");
  }

  function buildWaMessage(code) {
    return "Olá! Quero um orçamento direto com a fábrica.\n" +
           "CÓDIGO: " + code;
  }

  function buildWaUrl(code) {
    const text = encodeURIComponent(buildWaMessage(code));
    return "https://wa.me/" + AC_CFG.WA_PHONE_E164 + "?text=" + text;
  }

  function sendToCRM(payload) {
    try {
      const body = new URLSearchParams();
      body.append("action", "crm_whatsapp_click");
      body.append("empresa_projeto", payload.empresa_projeto || "");
      body.append("modelo_venda", payload.modelo_venda || "");
      body.append("gclid", payload.gclid || "");
      body.append("pagina_origem", payload.pagina_origem || "");
      body.append("event_id", payload.event_id || "");
      body.append("utm_source", payload.utm_source || "");
      body.append("utm_medium", payload.utm_medium || "");
      body.append("utm_campaign", payload.utm_campaign || "");
      body.append("utm_term", payload.utm_term || "");
      body.append("utm_content", payload.utm_content || "");
      body.append("referrer", payload.referrer || "");
      body.append("data_clique_google", payload.data_clique_google || "");

      fetch(AC_CFG.CRM_AJAX_URL, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: body.toString(),
        keepalive: true
      }).catch(function(){});
    } catch (e) {}
  }

  function handleWhatsAppClick(ev, source, code) {
    const waUrl = buildWaUrl(code);
    const eventId = makeEventId();
    const url = new URL(window.location.href);

    const payload = {
      empresa_projeto: AC_CFG.EMPRESA_PROJETO,
      modelo_venda: AC_CFG.MODELO_VENDA_PADRAO,
      gclid: readGclid(),
      pagina_origem: window.location.pathname,
      event_id: eventId,
      utm_source: url.searchParams.get("utm_source") || "",
      utm_medium: url.searchParams.get("utm_medium") || "",
      utm_campaign: url.searchParams.get("utm_campaign") || "",
      utm_term: url.searchParams.get("utm_term") || "",
      utm_content: url.searchParams.get("utm_content") || "",
      referrer: document.referrer || "",
      data_clique_google: formatLocalDateTime(),
      source: source || "cta"
    };

    sendToCRM(payload);

    try {
      ev.preventDefault();
      window.open(waUrl, "_blank", "noopener");
    } catch (e) {}
  }

  function bindWhatsApp() {
    document.querySelectorAll(".js-wa").forEach(function (el) {
      const code = (el.getAttribute("data-code") || "COIFA PARA COZINHA").trim();
      const source = (el.getAttribute("data-source") || "cta").trim();

      el.setAttribute("href", buildWaUrl(code));
      el.addEventListener("click", function (ev) {
        handleWhatsAppClick(ev, source, code);
      }, { passive: false });
    });
  }

  function bindFaq() {
    document.querySelectorAll(".faq-dark__question").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const item = btn.parentElement;
        item.classList.toggle("active");
      });
    });
  }

  try { storeGclidFromUrl(); } catch (e) {}
  bindFaq();
  bindWhatsApp();
})();