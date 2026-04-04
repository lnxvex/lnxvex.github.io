export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "content-type"
        }
      });
    }

    if (request.method !== "POST" || url.pathname !== "/event") {
      return new Response("Not found", { status: 404 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const type = typeof payload?.type === "string" ? payload.type : "";
    const packageName = typeof payload?.package === "string" ? payload.package : "";

    const now = new Date();
    const time = now.toLocaleTimeString("az-AZ", { hour12: false });

    const webhookUrl =
      type === "visit" ? env.VISIT_WEBHOOK_URL : type === "buy_click" ? env.CLICK_WEBHOOK_URL : "";

    if (!webhookUrl) {
      return new Response("OK", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    let content;
    if (type === "buy_click") {
      const safeName = packageName || "(paket seçilmədi)";
      content = `{🛒 Yeni Satış Fürsəti!\nBir müştəri ${safeName} paketi üçün "Almaq" düyməsinə kliklədi!\nTelegramını yoxla.\nLNXFLOW Sifariş Radarı | ${time}}`;
    } else {
      const country = request.cf?.country ? ` | ${request.cf.country}` : "";
      content = `{👀 Yeni Ziyarət!\nBir istifadəçi saytı ziyarət etdi.\nLNXFLOW Ziyarət Radarı | ${time}${country}}`;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ content })
      });
    } catch {
      return new Response("OK", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
