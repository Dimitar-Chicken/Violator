exports.run = (bot, cmdprefix, msg, args, db, roles) => {

  //Finds the settings file for future token obtaining.
  const settings = require('./../settings.json');
  //File system import.
  const fs = require('fs');
  //Imports the command information file.
  const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));

  //Checks if the command is 'default'.
  if (args[0] == undefined) {
    msg.channel.send(`Current server prefix: ${cmdprefix}`);
    return;
  } else if (roles.find(r => r.name === settings.bot_commander_role)) {
    if (args[0] == 'default') {
      //If so it sets the server prefix to the default one from the bot settings file.
      db.set(`servers.${msg.guild.id}_prefix`, `${settings.default_prefix}`).write();
      //Logs the prefix changing along with server ID and name.
      console.log(`Prefix for guild ${msg.guild.id} (name: ${msg.guild.name}) set to: ${settings.default_prefix}`);
      msg.channel.send(`Prefix successfully set to: \`${settings.default_prefix}\``);
      return;
    } else if (args[0].length > 2 || args[0].length < 1) {
      //Checks for incorrect command uses outside of 'default' case.
      //Notifies the user of incorrect command usage.
      msg.channel.send(`Incorrect usage. \`${cmdprefix}${commands['Prefix'].syntax}\``);
      return;
    }
  } else {
    //Sends a notification if the user doesn't have the permisison level.
    msg.channel.send("Insufficient permission level.");
    //Log which user and tag attempted to use higher level commands.
    console.log(`${msg.author.username} (tag: ${msg.author.tag}) on ${msg.guild.name} attempted to use clear cmd without sufficient permisison level.`);
    return;
  }
  var prefix = args[0].trim();

  //Sets the new prefix to the server id.
  db.set(`servers.${msg.guild.id}_prefix`, `${prefix}`).write();

  //Logs the prefix changing along with server ID and name.
  console.log(`Prefix for guild ${msg.guild.id} (name: ${msg.guild.name}) set to: ${prefix}`);
  msg.channel.send(`Prefix successfully set to: \`${prefix}\``);
}