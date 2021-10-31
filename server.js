const dbd = require("dbd.js")
 
const bot = new dbd.Bot({
  token: "OTAzNTk2OTkxNTMwMDIwOTE0.YXvSRg.HmcDehUnyW4wcT0L_vW0gT6HqaU", 
  prefix: "="
})
 
bot.onMessage()
 
bot.command({
  name: "ping",
  code: `Pong! \`$ping\` ms`
})