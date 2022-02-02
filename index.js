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
client.login(process.env["TOKEN"]);

/* 
Note to self:
Replit uses UTC timezone, so when dealing with time you need
to convert it to whatever timezone you're currently in
*/
cron.schedule("0 12 * * *", async function() { // convert UTC to EST, this is 7am EST 
  client.channels.cache.get("936761148244627478").send("It is 7am. Have a nice day!");
  const quote = await getQuote();
  client.channels.cache.get("936761148244627478").send(quote);
  const weather = await getWeather();
  client.channels.cache.get("936761148244627478").send("Here is today's weather:");
  client.channels.cache.get("936761148244627478").send("description: " + weather.description);
  client.channels.cache.get("936761148244627478").send("tempMin :" + weather.tempMin);
  client.channels.cache.get("936761148244627478").send("tempMax: " + weather.tempMax);
  client.channels.cache.get("936761148244627478").send("humidity: " + weather.humidity);
  client.channels.cache.get("936761148244627478").send("uv: " + weather.uv);
});


// weather stuff
openWeatherAPIUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=43.26097739706666&lon=-79.91909822038852&exclude=current,minutely,hourly&appid=" + process.env["openWeatherAPIKey"] + "&units=metric"; // lat&long is for McMaster

async function getWeather() {
  const response = await fetch(openWeatherAPIUrl);
  const data = await response.json();

  const weather = {
    description: data["daily"][0]["weather"][0]["description"],
    tempMin: data["daily"][0]["temp"]["min"],
    tempMax: data["daily"][0]["temp"]["max"],
    humidity: data["daily"][0]["humidity"],
    uv: data["daily"][0]["uvi"]
  };

  return weather;
}


/* 
TODO:
- weather api => open weather api
  - use: https://openweathermap.org/api/one-call-api
  - general weather
    - use: https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
    - account for alerts
  - temp
  - humidity
  - expected max UV index
  - Mac lat, long:
    - 43.26097739706666, -79.91909822038852
- word of the day
  - check a week later for API key
  - https://www.wordnik.com/users/jooo-lee/API
- song of the day
  - watch rest of FCC discord.js vid
  - can i make a queue? w replit db
*/