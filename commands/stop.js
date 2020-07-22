exports.run = (bot, prefix, msg, args, db, roles, queue) => {

    //Finds the settings file for future token obtaining.
    const settings = require('../settings.json');
    //File system import.
    const fs = require('fs');
    //Imports the command information file.
    const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));

    //ytdl package used to download YouTube videos.
    const ytdl = require('ytdl-core');

    //serverQueue for songs.
    const voiceChannel = msg.member.voiceChannel;
    const serverQueue = queue.get(msg.guild.id);

    if (!voiceChannel) {
        msg.channel.reply("You must be in a voice channel to stop the music.");
        return;
    }

    serverQueue.connection.disconnect();
    queue.delete(msg.guild.id);
}