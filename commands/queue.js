exports.run = (bot, prefix, msg, args, db, roles, queue) => {

    const Discord = require('discord.js');
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

    //The help embed, setColor sets the border color.
    var queueEmbed = new Discord.RichEmbed().setColor(0x664785);
    queueEmbed.setTitle("__**NEXT IN QUEUE:**__");

    var queueCopy = [];

    for (i = 0; i < 10; i++) {
        if (serverQueue.songs[i] != undefined) {
            queueCopy[i] = serverQueue.songs[i];
        }
    }

    embedSender(msg, queueCopy, queueEmbed);
}

function embedSender(msg, queueCopy, queueEmbed) {

    //**Embed Builder**
    //Creates the embed body

    var count = 0;
    
    //Sending the currently playing song.
    var nowPlaying = queueCopy.shift();
    msg.channel.send(`__**NOW PLAYING:**__\n${nowPlaying.url}`)

    if (queueCopy.length > 0) {
        queueCopy.forEach((i) => {
            count += 1;
            //Field for the song titles
            queueEmbed.addField(`${count}. ${i.title}`, i.url);
        });
        queueEmbed.setFooter(`Currently showing next ${count} songs in the queue.`);
        console.log("Queue embed completed.");
    }
    msg.channel.send(queueEmbed);
    console.log(`Queue embed sent to ${msg.guild.name}`);
}