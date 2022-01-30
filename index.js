// Load necessary modules
const Discord = require("discord.js");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const keepAlive = require("./server");

// Create a new client instance
const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES"
  ]
});

const zenQuotesAPIUrl = "https://zenquotes.io/api/today";

// Fetch daily quote from https://zenquotes.io/
async function getQuote() {
  const response = await fetch(zenQuotesAPIUrl);
  const data = await response.json();
  return data[0]["q"] + " -" + data[0]["a"];
}

// When the client is ready, run this code
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
  // Don't want bot to reply to itself
  if (msg.author.bot) return;

  // Just for fun hehe
  if (msg.content === "hi") {
    msg.reply("no.");
  }

  // Send quote of the day when someone types "$dailyquote"
  if (msg.content === "$dailyquote") {
    const quote = await getQuote();
    msg.channel.send(quote);
  }
});

keepAlive();

// Log in to Discord with client's token
client.login(process.env['TOKEN']);