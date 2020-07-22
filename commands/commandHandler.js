exports.run = (bot, message, db, queue) => {
    const {default_prefix} = require('../settings.json');
    let prefix;

    if (!message.guild) {
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
    if ((!message.content.startsWith(prefix) || message.author.bot) &&
        (!message.content.startsWith(`${default_prefix}prefix`) &&
            !message.content.startsWith(`${default_prefix}help`))) {
        return;
    }

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
        let commandFile = require(`./${cmd}.js`);
        //The stored command file is ran with the function arguments of bot, message and arguments.
        commandFile.run(bot, prefix, message, args, db, roles, queue);
    } catch (e) {
        //Error logging
        console.log(e);
    } finally {
        //Command usage logging, who used what command.
        console.log(`${message.author.username} (tag: ${message.author.tag}) ran the command: ${cmd}`)
    }
}