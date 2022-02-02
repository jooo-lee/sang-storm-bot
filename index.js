// Load necessary modules
const Discord = require("discord.js");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const keepAlive = require("./server");
const cron = require("node-cron");

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
    msg.reply(":fortune_cookie:");
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

/* 
Note to self:
Replit uses UTC timezone, so when dealing with time you need
to convert it to whatever timezone you're currently in
*/
cron.schedule("0 12 * * *", async function() { // convert UTC to EST, this is 7am EST 
  client.channels.cache.get("936761148244627478").send("It is 7am. Have a nice day!");
  const quote = await getQuote();
  client.channels.cache.get("936761148244627478").send(quote);
});

/* 
TODO:
- weather api
  - general weather
  - temp
  - humidity
  - expected max UV index
- word of the day
- song of the day
  - watch rest of FCC discord.js vid
  - can i make a queue? w replit db
*/