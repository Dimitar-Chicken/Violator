const Discord = require('discord.js');
const bot = new Discord.Client();
//Bot settings file, contains tokens and prefix.
const {token} = require('./settings.json');
//LowDB database.
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/violatorbot_db.json');
const db = low(adapter);
db.defaults({
  servers: {}
}).write();

bot.on('ready', () => {
  console.log(`Launching ${bot.user.tag}...`);
  console.log("Successful launch.\n");
  //Bot status to display help cmd.
  bot.user.setPresence({
    game: {
      name: '~help'
    },
    status: 'online'
  });
});

bot.on('message', message => {

  let commandHandler = require('./commands/commandHandler.js');
  commandHandler.run(bot, message, db);
});

bot.login(token);