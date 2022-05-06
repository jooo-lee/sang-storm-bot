// Load necessary modules
const Discord = require("discord.js");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const keepAlive = require("./server");
const cron = require("node-cron");
const Database = require("@replit/database");

// Create a new client instance
const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES"
  ]
});

// Create a new database
const db = new Database();

// Store song of the day
const dailySongs = [
  "https://open.spotify.com/track/38umMmZQdeoOG7Zojor4g3?si=a0bb92cbfbcb4031", // ANGOSTURA - Keshi
  "https://open.spotify.com/track/4jXl6VtkFFKIt3ycUQc5LT?si=f38e115959ab4dfc", // Circles - Mac Miller
  "https://open.spotify.com/track/2SLwbpExuoBDZBpjfefCtV?si=9d1eb960e0c44c7c" // Out of time - The Weeknd
];

// Initialize daily songs in database
(async () => {
  let songs = await db.get("songs");
  if (!songs || songs.length < 1) {
    await db.set("songs", dailySongs);
    console.log("init")
    return;
  }
  console.log(songs);
})();

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

  // Send song of the day when someone types "$dailysong"
  if (msg.content === "$dailysong") {
    // const song = 
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
// cron.schedule("30 25 2 * * *", async function() { // for testing
cron.schedule("0 12 * * *", async function() { // convert UTC to EST, this is 7am EST 
  const dailyMsg = await getDailyMsg();
  client.channels.cache.get("936761148244627478").send(dailyMsg);
});

async function getDailyMsg() {
  const weather = await getWeather();
  const quote = await getQuote();
  const wordOfTheDay = await getWordOfTheDay();
  const dailyMsg = "Good morning everyone! Welcome back to another episode of **Sang Storm!** " +
  ":robot: \nFor today's **weather**, we have: " +
  weather.description + "! " + weather.weatherEmoji + "\n \n" +
  "The **temperature** will range from " + weather.tempMin + "°C to " + weather.tempMax + 
  "°C :thermometer:\n" + "The **humidity** will reach a peak at " + weather.humidity + 
  "% :droplet:\n" + "The **expected max UV index** for today will be: " + weather.uvEmoji + "\n" +
  "Be sure to take the necessary precautions when going outside! :100:" + "\n \n" + 
  "Your **daily fortune cookie** for today is ~ :fortune_cookie: \n" + "||" + quote + "||" + "\n \n" +
    "Your **word of the day** is ~ :abc: \n" +
    "> **" + wordOfTheDay.word + "** \n" + 
    "> (" + wordOfTheDay.partOfSpeech + ") " + wordOfTheDay.definition;
  return dailyMsg;
}

const openWeatherAPIUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=43.26097739706666&lon=-79.91909822038852&exclude=current,minutely,hourly,alerts&appid=" + process.env["openWeatherAPIKey"] + "&units=metric"; // lat&long is for McMaster

// Return appropriate emoji depending on weather id
function getWeatherEmoji(id) {
  switch(true) {
    case id < 300:
      return ":cloud_lightning:";
    case id < 600:
      return ":cloud_rain:";
    case id < 700:
      return ":snowflake:";
    case id < 800:
      return ":fog:";
    case id == 800:
      return ":sunny:";
    case id < 900:
      return ":cloud:";
    default:
      return;
  }
}

// Return low, moderate, high and appropriate emoji depending on uv
function getUVEmoji(uv) {
  let uvEmojiArr = [":zero:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:", 
  ":seven:", ":eight:", ":nine:", ":keycap_ten:", ":fire:", ":fire:"];

  if (uv <= 2) {
    return "a low " + uvEmojiArr[uv];
  } else if (uv <= 5) {
    return "a moderate " + uvEmojiArr[uv];
  } else if (uv <= 7) {
    return "a high " + uvEmojiArr[uv];
  } else if (uv <= 10) {
    return "a very high " + uvEmojiArr[uv];
  } else {
    return uvEmojiArr[uv]; 
  }
}

// Fetch daily weather from https://openweathermap.org/api
async function getWeather() {
  const response = await fetch(openWeatherAPIUrl);
  const data = await response.json();

  const weather = {
    description: data["daily"][0]["weather"][0]["description"],
    id: data["daily"][0]["weather"][0]["id"],
    tempMin: Math.round(data["daily"][0]["temp"]["min"]),
    tempMax: Math.round(data["daily"][0]["temp"]["max"]),
    humidity: data["daily"][0]["humidity"],
    uv: Math.floor(data["daily"][0]["uvi"]) // not sure how they round uv index
  };

  weather.weatherEmoji = getWeatherEmoji(weather.id);
  weather.uvEmoji = getUVEmoji(weather.uv);

  return weather;
}

const zenQuotesAPIUrl = "https://zenquotes.io/api/today";

// Fetch daily quote from https://zenquotes.io/
async function getQuote() {
  const response = await fetch(zenQuotesAPIUrl);
  const data = await response.json();
  return data[0]["q"] + " -" + data[0]["a"];
}

const wordnikAPIUrl = "https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=" + process.env["wordnikAPIKey"];

// Fetch daily word from wordnikAPI 
async function getWordOfTheDay() {
  const response = await fetch(wordnikAPIUrl);
  const data = await response.json();

  const wordOfTheDay = {
    word: data["word"],
    partOfSpeech: data["definitions"][0]["partOfSpeech"],
    definition: data["definitions"][0]["text"]
  };

  return wordOfTheDay;
}


/* 
TODO:
- song of the day
  - can i make a queue? w replit db => just use array instead?
  - https://stackoverflow.com/questions/34970608/check-if-string-is-spotify-url
    - for checking spotify urls

- minor issue: daylight savings time
*/