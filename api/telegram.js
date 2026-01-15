export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const update = req.body;

  // 1️⃣ /start command → send invoice
  if (update.message?.text === "/start") {
    const chatId = update.message.chat.id;

    await fetch(`${TELEGRAM_API}/sendInvoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        title: "NL Proxy – 1 Month",
        description: "Private Netherlands proxy access for 30 days",
        payload: "nl_proxy_1_month",
        currency: "XTR", // Telegram Stars
        prices: [
          {
            label: "1 Month Subscription",
            amount: 100 // 100 Stars (TEST PRICE)
          }
        ]
      })
    });

    return res.status(200).json({ ok: true });
  }

  // 2️⃣ Required: pre-checkout approval
  if (update.pre_checkout_query) {
    await fetch(`${TELEGRAM_API}/answerPreCheckoutQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok: true
      })
    });

    return res.status(200).json({ ok: true });
  }

  // 3️⃣ Payment successful
  if (update.message?.successful_payment) {
    const chatId = update.message.chat.id;

    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ Payment received!\nYour NL proxy details will be sent shortly."
      })
    });

    return res.status(200).json({ ok: true });
  }

  res.status(200).json({ ok: true });
}
