// Require the necessary discord.js classes
const Discord = require("discord.js");

// Create a new client instance
const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES"
  ]
});

// When the client is ready, run this code (only once)
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Bot replies with "pong" when someone says "ping"
client.on("messageCreate", (msg) => {
  if (msg.content === "ping") {
    msg.reply("pong");
  }
});

// Log in to Discord with client's token
client.login(process.env['TOKEN']);