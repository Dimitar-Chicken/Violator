exports.run = async (bot, prefix, msg, args, db, roles) => {

  const Discord = require('discord.js');
  //File system import.
  const fs = require('fs');
  //Imports the command information file.
  const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));
  
  //The help embed, setColor sets the border color.
  const onlyHelp = new Discord.RichEmbed().setColor(0x664785);

  //Counts the number of commands found.
  let commandsFound = 0;
  //Singular or plural spelling
  let correctCommandSpelling = "commands";
  //Checks that args are added to the command call.
  if ((args.length > 1 && args[0] != 'server') || args.length > 2) {
    msg.channel.send(`Incorrect usage. \`${prefix}${commands['Help'].syntax}\``);
    return;
  }

  onlyHelp.setTitle("**COMMAND HELP**");
  //If an empty help request is made, it shows correct command usage.
  for (var cmd in commands) {

    if (args[args.length - 1] == undefined || args[args.length - 1] == 'server') {
      commandsFound++;
      //Adds the main information fields to the embed.
      onlyHelp.addField(`**${commands[cmd].name}**`, `**Description:** ${commands[cmd].description}\n**Group:** ${commands[cmd].group}\n**Syntax:** ${prefix + commands[cmd].syntax}`);
      onlyHelp.addField(`*Example*:`, `${prefix + commands[cmd].examples[0]}`);
      onlyHelp.addBlankField();
      onlyHelp.setFooter(`Currently showing all commands. To view any group/command use ${prefix}help [group / command]`);
    } else if (commands[cmd].name.toLowerCase() == args[args.length - 1] || commands[cmd].group.toLowerCase() == args[args.length - 1]) {
      commandsFound++;
      //Adds the main information fields to the embed.
      onlyHelp.addField(`**${commands[cmd].name}**`, `**Description:** ${commands[cmd].description}\n**Syntax:** ${prefix + commands[cmd].syntax}`);
      for (var i = 0; i < commands[cmd].examples.length; i++) {
        onlyHelp.addField(`*Example*:`, `${prefix + commands[cmd].examples[i]}`);
      }
      onlyHelp.addBlankField();
      onlyHelp.setFooter(`Currently showing ${commands[cmd].group} group. To view another group or command use ${prefix}help [group / command]`);
    }
  }

  if (commandsFound == 0) {
    msg.channel.send(`No commands found. Try a different query.`);
    return;
  }
  //Field for the command usage key.
  onlyHelp.addBlankField();
  onlyHelp.addField(`Server prefix for ${msg.guild.name}: `, `\`${prefix}\``);
  onlyHelp.addField(`${commandsFound} ${correctCommandSpelling} found`, `\`<> - required, [] - optional\``);

  //Sets the correct singular or plural of 'command'.
  if (commandsFound == 1) {
    correctCommandSpelling = "command";
  }
  console.log("Help embed completed.");

  if (args[0] == 'server') {
    //Sends the channel to the server where the message originated.
    msg.channel.send(onlyHelp);

    console.log(`Help embed sent to ${msg.guild.name}`);

  } else {
    //Sends the help result through Direct Messages.
    msg.author.send(onlyHelp);

    console.log(`Help embed sent to ${msg.author.name} (tag: ${msg.author.tag})`);

    //Deletes the command message so as to avoid chat cluttering, purely cosmetic.
    await msg.delete();

    //Chat message to notify user where to find help.
    msg.channel.send('I have sent a help message in Direct Messages.').then(msg => {
      setTimeout(async function () {
        await msg.delete();
      }, 4500);
    });
  }
}