//Asyncronous method so as to guarantee the commands are ran in the correct order.
exports.run = async (bot, prefix, msg, args, db, roles) => {

  const settings = require('./../settings.json');
  //File system import.
  const fs = require('fs');
  //Imports the command information file.
  const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));
  
  //Checks that args are added to the command call.
  if (args[0] == undefined || args[0] < 1 || args[0] > 100 || args.length > 1) {
    msg.channel.send(`Incorrect usage. \`${prefix}${commands['Clear'].syntax}\``);
    return;
  }
  if (roles.find(r => r.name === settings.bot_commander_role)) {
    //The command message is deleted so that the correct (requested) amount of messages can be deleted.
    await msg.delete();
    //After the 'clear' message has been deleted, the fetchMessages function is ran.
    //It goes through the origin channel and retrieves the requested amount of messages, which are then stored in 'fetched'.
    const fetched = await msg.channel.fetchMessages({
        limit: args[0]
      })
      //Error logging
      .catch(error => console.log(error));
    //Checks if no messages are retrieved.
    //Logs the amount of messages found.
    if (fetched.size < 1) {
      //Displays when there are no messages found by the fetchMessages function.
      console.log(`No more messages found.`);
      return;
    }
    console.log(`${fetched.size} messages found, deleting...`);
    //Uses the bulkDelete function to remove the messages based on the collection of references.
    await msg.channel.bulkDelete(fetched, true)
      //Logs the amount of messages deleted.
      .then(messages => console.log(`Successfully deleted ${messages.size} messages.\n`))
      //Error logging.
      .catch(error => console.log(error));
    return;
  } else {
    //Sends a notification if the user doesn't have the permisison level.
    msg.channel.send("Insufficient permission level.");
    //Log which user and tag attempted to use higher level commands.
    console.log(`${msg.author.username} (tag: ${msg.author.tag}) on ${msg.guild.name} attempted to use clear cmd without sufficient permisison level.`);
    return;
  }
}