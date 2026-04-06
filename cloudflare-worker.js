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
    const date = now.toLocaleDateString("az-AZ");

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

    let discordPayload;
    if (type === "buy_click") {
      const safeName = packageName || "(paket seçilmədi)";
      discordPayload = {
        embeds: [
          {
            title: "🛒 Yeni sifariş kliksi",
            description: "Bir istifadəçi paket sifarişi üçün klik etdi.",
            color: 0xff3d71,
            fields: [
              {
                name: "Paket",
                value: safeName,
                inline: false
              },
              {
                name: "Status",
                value: "Telegram sifariş axınını yoxla",
                inline: false
              },
              {
                name: "Saat",
                value: `${date} • ${time}`,
                inline: false
              }
            ],
            footer: {
              text: "LNXFLOW Sifariş Radarı"
            }
          }
        ]
      };
    } else {
      const country = request.cf?.country || "Naməlum";
      const city = request.cf?.city || "Naməlum";
      discordPayload = {
        embeds: [
          {
            title: "👀 Yeni ziyarət",
            description: "Sayta yeni istifadəçi daxil oldu.",
            color: 0x33e6ff,
            fields: [
              {
                name: "Ölkə",
                value: country,
                inline: true
              },
              {
                name: "Şəhər",
                value: city,
                inline: true
              },
              {
                name: "Saat",
                value: `${date} • ${time}`,
                inline: false
              }
            ],
            footer: {
              text: "LNXFLOW Ziyarət Radarı"
            }
          }
        ]
      };
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(discordPayload)
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
