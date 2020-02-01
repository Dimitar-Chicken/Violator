const Discord = require('discord.js');
const bot = new Discord.Client();
//Bot settings file, contains tokens and prefix.
const { default_prefix, token } = require('./settings.json');
var prefix;
//LowDB database.
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/violatorbot_db.json');
const db = low(adapter);
db.defaults({
  servers: {}
}).write();

//TODO: Add current server prefix as a role
//TODO: Store role id in debug

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

  if(!message.guild) {
    return;
  }
  
  //**Prefix processing**
  //Retrieves the current prefix from the DB.
  prefix = db.get(`servers.${message.guild.id}_prefix`).value();

  //If no prefix is found for the server, the default one is set.
  if (prefix == undefined) {
    prefix = default_prefix;
  }

  //**Message processing**

  //Checks to make sure the message starts with a prefix, it is not the bot sending the message and the message is not being read in Direct Messages.
  if ((!message.content.startsWith(prefix) || message.author.bot) && (!message.content.startsWith(`${default_prefix}prefix`) && !message.content.startsWith(`${default_prefix}help`))) {
    return;
  }

  //The message is converted to upper case, to ensure that there are no case sensitivity issues.
  let msg = message.content.toUpperCase();
  //The message is split up into arguments at every space, the prefix is removed.
  let args = message.content.slice(prefix.length).trim().split(' ');
  //Determines if a default prefix command is used and how to split the arguments based on that.
  if (message.content.startsWith(`${default_prefix}prefix`) || message.content.startsWith(`${default_prefix}help`)) {
    args = message.content.slice(default_prefix.length).trim().split(' ');
  } else {
    args = message.content.slice(prefix.length).trim().split(' ');
  }
  //The first word or "command" is stored and converted back to lower case
  let cmd = args.shift().toLowerCase();
  //Stores the user's roles for permission checks
  let roles = message.member.roles;

  try {
    //The commands are ran by passing the variable select the {cmd}.js file
    let commandFile = require(`./commands/${cmd}.js`);
    //The stored command file is ran with the function arguments of bot, message and arguments.
    commandFile.run(bot, message, args, db, roles);
  } catch (e) {
    //Error logging
    console.log(e);
  } finally {
    //Command usage logging, who used what command.
    console.log(`${message.author.username} (tag: ${message.author.tag}) ran the command: ${cmd}`)
  }
});

bot.login(token);
