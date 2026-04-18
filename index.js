require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// ✅ WEB SERVER
const app = express();
app.get("/", (req, res) => res.send("✅ Bot Alive"));
app.listen(3000, () => console.log("🌐 Web running"));

// ✅ DEBUG
console.log("🔍 TOKEN exists:", !!process.env.TOKEN);

// ✅ CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ✅ READY EVENT
client.on("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ✅ LOGIN DEBUG
console.log("🔑 Logging in...");

client.login(process.env.TOKEN)
  .then(() => console.log("✅ Login successful"))
  .catch(err => console.error("❌ Login FAILED:", err.message));
