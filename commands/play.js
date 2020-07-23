exports.run = async (bot, prefix, msg, args, db, roles, queue) => {

  //Finds the settings file for future token obtaining.
  const settings = require('../settings.json');
  //File system import.
  const fs = require('fs');
  //Imports the command information file.
  const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));

  //ytdl package used to download YouTube videos.
  const ytdl = require('ytdl-core');

  const voiceChannel = msg.member.voiceChannel;
  var serverQueue = queue.get(msg.guild.id);

  if (!voiceChannel){
    msg.channel.send("You must be in a voice channel to summon the bot.");
    return;
  }

  if(args[0] == undefined){
    msg.channel.send(`Incorrect usage. \`${prefix}${commands['Page3']['Play'].syntax}\``);
    return;
  }

  if(!validateYouTubeUrl(args[0])){
    msg.channel.send("Invalid YouTube URL.");
    return;
  }

  //Song info.
  const songInfo = await ytdl.getInfo(args[0]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  //Song queue.
  if (serverQueue == undefined) {
    const queueContract = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(msg.guild.id, queueContract);

    queueContract.songs.push(song);

    serverQueue = queue.get(msg.guild.id);

    try{ 
      var conn = await voiceChannel.join();
      queueContract.connection = conn;

      play(msg, serverQueue.songs[0]);
    }
    catch (err) {
      console.log(err);
      queue.delete(msg.guild.id);
      msg.channel.send("Could not add song to playlist due to an error. Please kindly yell at \`anoobis#1490\`.");
      return;
    }
  }
  else {
    serverQueue.songs.push(song);
    msg.channel.send(`${song.title} has been added to the queue.`);
    return;
  }

  //Play function
  function play(message, song) {
    if(!song){
      serverQueue.voiceChannel.leave();
      queue.delete(message.guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
        .playStream(ytdl(song.url), {filter: "audioonly"})
        .on("end", () => {
          serverQueue.songs.shift();
          play(message, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error))
        .on("finish", () => {
          serverQueue.connection.disconnect();
          queue.delete(msg.guild.id);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Now playing: **${song.title}**`)
  }

  function validateYouTubeUrl(url)
  {
    if (url != undefined || url != '') {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      var match = url.match(regExp);
      if (match && match[2].length == 11) {
        return true;
      }
      else {
        return false;
      }
    }
  }
}