exports.run = async (bot, prefix, msg, args, db, roles) => {

    const Discord = require('discord.js');
    //File system import.
    const fs = require('fs');
    //Imports the command information file.
    const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));

    //The help embed, setColor sets the border color.
    var helpEmbed = new Discord.RichEmbed().setColor(0x664785);
    helpEmbed.setTitle("**COMMAND HELP**");

    //Sends incorrect usage message if the command length is more than three arguments or has more than 1 page number.
    if (args.length > 3 || args.filter(x => !isNaN(x)).length > 1) {
        msg.channel.send(`Incorrect usage. \`${prefix}${commands['Page1']['Help'].syntax}\``);
        return;
    }

    //Sends incorrect usage message if the arguments are out of order.
    if (args.length == 3 && (args[args.length - 2] != 'server' || isNaN(args[args.length - 3]))) {
        msg.channel.send(`Incorrect usage. \`${prefix}${commands['Page1']['Help'].syntax}\``);
        return;
    } else if (args.length == 2 && (!isNaN(args[args.length - 2]) && args[args.length - 1] != 'server')) {
        msg.channel.send(`Incorrect usage. \`${prefix}${commands['Page1']['Help'].syntax}\``);
        return;
    }

    //When the first keyword is a number, the JSON array is only searched in that specific page.
    if (!isNaN(args[0])) {
        for (var cmd in commands[`Page${args[0]}`]) {
            embedBuilder(prefix, args, commands, `Page${args[0]}`, cmd, helpEmbed);
        }

        //Sends no commands found message if the command isn't present on the current page
        if (helpEmbed.fields.length == 0) {
            msg.channel.send("No commands found, please try a different query.");
            return;
        }

        embedSender(prefix, args, msg, helpEmbed);

        //When the first keyword is not a number, all the pages are searched.
    } else if (isNaN(args[0])) {
        for (var page in commands) {
            for (var cmd in commands[page]) {
                embedBuilder(prefix, args, commands, page, cmd, helpEmbed);
            }

            //Only sends a non-empty embed.
            if (helpEmbed.fields.length > 0) {
                embedSender(prefix, args, msg, helpEmbed);

                //Creates a new embed in order to print multiple pages from the command JSON.
                helpEmbed = new Discord.RichEmbed().setColor(0x19B366);
                helpEmbed.setTitle("**COMMAND HELP**");
                return;

                //Sends no commands found message if the command isn't present in any of the pages.
            } else if (helpEmbed.fields.length == 0 && page == `Page${Object.keys(commands).length}`) {
                msg.channel.send("No commands found, please try a different query.");
                return;
            }
        }
        //Sends no commands found message if the command isn't present in any of the pages.
        if (helpEmbed.fields.length == 0) {
            msg.channel.send("No commands found, please try a different query.");
            return;
        }
    }
}

function embedBuilder(prefix, args, commands, page, cmd, helpEmbed) {

    //**Embed Builder**
    //Creates the embed body based on the searched query

    //Checks if the command matches any names/groups in the JSON file.
    if (args[args.length - 1] == commands[page][cmd].name.toLowerCase() || args[args.length - 1] == commands[page][cmd].group.toLowerCase()) {

        //Adds the main information fields to the embed.
        helpEmbed.addField(`**${commands[page][cmd].name}**`, `**Description:** ${commands[page][cmd].description}\n**Syntax:** ${prefix}${commands[page][cmd].syntax}`);
        for (var i = 0; i < commands[page][cmd].examples.length; i++) {
            helpEmbed.addField(`*Example*:`, `${prefix + commands[page][cmd].examples[i]}`);
        }
        helpEmbed.addBlankField();
        helpEmbed.setFooter(`Currently showing ${commands[page][cmd].group} group. To view another group or command use ${prefix}help [group / command]`);

        //If it doesn't match any names/groups, it checks what the first command word is.
    } else if (args[args.length - 1] == undefined || args[args.length - 1] == 'server' || !isNaN(args[args.length - 1])) {
        //Adds the main information fields to the embed.
        helpEmbed.addField(`**${commands[page][cmd].name}**`, `**Description:** ${commands[page][cmd].description}\n**Group:** ${commands[page][cmd].group}\n**Syntax:** ${prefix + commands[page][cmd].syntax}`);
        helpEmbed.addField(`*Example*:`, `${prefix + commands[page][cmd].examples[0]}`);
    }
}

function embedSender(prefix, args, msg, helpEmbed) {

    //**Embed Builder**
    //Creates the embed body based on the searched query

    //Field for the command usage key.
    helpEmbed.addBlankField();
    helpEmbed.addField(`Server prefix for ${msg.guild.name}: \`${prefix}\``, `\`<> - required, [] - optional\`\n Use \`${prefix}help [number]\` to display other help pages.`);
    helpEmbed.setFooter(`Currently showing all commands. To view any group/command use ${prefix}help [group / command]`);

    console.log("Help embed completed.");

    if (args.includes('server')) {
        //Sends the channel to the server where the message originated.
        msg.channel.send(helpEmbed);

        console.log(`Help embed sent to ${msg.guild.name}`);
    } else {
        //Sends the help result through Direct Messages.
        msg.author.send(helpEmbed);

        console.log(`Help embed sent to ${msg.author.username} (tag: ${msg.author.tag})`);

        //Chat message to notify user where to find help.
        msg.channel.send('I have sent a help message in Direct Messages.');
    }
}