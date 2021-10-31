const { BotClient } = require("./client/BotClient.js");
const client = new BotClient(process.env.TOKEN);

client.start();

// Now ping the bot every so often to make sure it does not go offline.

const http = require('http');
const express = require('express');
const app = express();

app.get("/", (request, response) => {
    const date = new Date();
    const format = `${date.getDay()}-${date.getMonth()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getMinutes()}`;
    
    console.log(`Ping recheived on ${format}`);
    response.sendStatus(200);
});

app.listen(process.env.PORT, () => {
    console.log("Patrol log bot listening on port " + process.env.PORT)
});

setInterval(() => {
    http.get("http://dhplb.glitch.me/");
}, 5000);
