exports.run = async (bot, prefix, msg, args, db) => {

    //File system import.
    const fs = require('fs');
    //Imports the command information file.
    const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));

    const channel = msg.channel;

    let clapped = "";

    //Checks that args are added to the command call.
    if (args[0] == undefined) {
        msg.channel.send(`Incorrect usage. \`${prefix}${commands['Clap'].syntax}\``);
        return;
    }

    //Add clap emote after every word.
    for (var i = 0; i<args.length; i++){
        clapped += `${args[i]} 👏 `;
    }

    //Send the message to the channel and delete the user message.
    await msg.delete();
    await channel.send(clapped);
}