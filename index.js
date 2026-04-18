require("dotenv").config();
const fs = require("fs");
const express = require("express");
const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");

// ✅ WEB SERVER (Render 24/7)
const app = express();
app.get("/", (req, res) => res.send("✅ Bot Alive"));
app.listen(3000, () => console.log("🌐 Web running"));

// ✅ CLIENT (ALL INTENTS FOR FULL LOG SYSTEM)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User
  ]
});

client.commands = new Collection();

// ✅ LOAD DATA
client.configs = require("./data/config.json");
client.words = require("./data/words.json");
client.cases = require("./data/cases.json");

// ✅ CONFIG SYSTEM (PER SERVER)
client.getConfig = (guildId) => {
  if (!client.configs[guildId]) {
    client.configs[guildId] = {
      logChannel: null,
      whitelist: []
    };
    fs.writeFileSync("./data/config.json", JSON.stringify(client.configs, null, 2));
  }
  return client.configs[guildId];
};

client.saveConfig = () => {
  fs.writeFileSync("./data/config.json", JSON.stringify(client.configs, null, 2));
};

// ✅ CASE SYSTEM
client.addCase = (guildId, data) => {
  if (!client.cases[guildId]) client.cases[guildId] = [];

  const id = client.cases[guildId].length + 1;

  client.cases[guildId].push({
    id,
    ...data,
    time: new Date()
  });

  fs.writeFileSync("./data/cases.json", JSON.stringify(client.cases, null, 2));
};

// ✅ UNIVERSAL LOG FUNCTION
client.log = async (guild, data) => {
  const config = client.getConfig(guild.id);
  if (!config.logChannel) return;

  const ch = guild.channels.cache.get(config.logChannel);
  if (!ch) return;

  try {
    if (data.data) {
      await ch.send({ embeds: [data] });
    } else {
      await ch.send({ embeds: [data] });
    }
  } catch (err) {
    console.error("Log Error:", err);
  }
};

// ✅ ✅ EXECUTOR FETCH SYSTEM (FINAL UPGRADE 🔥)
const { AuditLogEvent } = require("discord.js");

client.getExecutor = async (guild, type) => {
  try {
    const logs = await guild.fetchAuditLogs({
      limit: 1,
      type: type
    });

    const entry = logs.entries.first();
    return entry?.executor || null;
  } catch {
    return null;
  }
};

// ✅ LOAD COMMANDS
fs.readdirSync("./commands").forEach(file => {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
});

// ✅ LOAD EVENTS (AUTO LOAD ALL LOG FILES ✅)
fs.readdirSync("./events").forEach(file => {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// ✅ DEBUG START
console.log("🚀 Starting bot...");

// ✅ ERROR HANDLING
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ✅ LOGIN
client.login(process.env.TOKEN);