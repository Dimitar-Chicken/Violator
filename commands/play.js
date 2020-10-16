exports.run = async (bot, prefix, msg, args, db, roles, queue) => {

    //YouTube API access token
    const { youtube_token } = require('./../settings.json');
    //File system import.
    const fs = require('fs');
    //Imports the command information file.
    const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));

    //ytdl package used to download YouTube videos.
    const ytdl = require('ytdl-core');
    const ytdlDiscord = require('ytdl-core-discord');
    
    //got package used to make API requests.
    const got = require('got');

    const voiceChannel = msg.member.voiceChannel;
    var serverQueue = queue.get(msg.guild.id);

    if (!voiceChannel) {
        msg.channel.send("You must be in a voice channel to summon the bot.");
        return;
    }

    if (args[0] == undefined) {
        msg.channel.send(`Incorrect usage. \`${prefix}${commands['Page3']['Play'].syntax}\``);
        return;
    }

    switch (validateYouTubeUrl(args[0])) {
        case "invalid":
            msg.channel.send("Invalid YouTube URL.");
            return;

        case "validVideo":
            addToQueue(args[0], false);
            return;

        case "validPlaylist":
            getVideosFromPlaylist(args[0])
            return;

        default:
            msg.channel.send("Invalid YouTube URL.");
            return;
    }

    async function addToQueue(videoUrl, isPlayList) {
        //Song info.
        const songInfo = await ytdl.getInfo(videoUrl);
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

            try {
                var conn = await voiceChannel.join();
                conn.on("disconnect", () => {
                    queue.delete(msg.guild.id);
                });
                queueContract.connection = conn;

                play(msg, serverQueue.songs[0]);
            }
            catch (err) {
                console.log(err);
                queue.delete(msg.guild.id);
                msg.channel.send("Could not add song to queue due to an error. Please kindly yell at \`anoobis#1490\`.");
                return;
            }
        }
        else {
            serverQueue.songs.push(song);
            if (!isPlayList) {
                msg.channel.send(`${song.title} has been added to the queue.`);
            }
            return;
        }
    }

    //Play function
    async function play(message, song) {
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(message.guild.id);
            return;
        }

        const dispatcher = serverQueue.connection
            .playOpusStream(await ytdlDiscord(song.url), { filter: "audioonly" })
            .on("error", error => console.error(error))
            .on("end", () => {
                serverQueue.songs.shift();
                play(message, serverQueue.songs[0]);
            })
            .on("finish", () => {
                serverQueue.connection.disconnect();
                queue.delete(msg.guild.id);
            });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Now playing: **${song.title}**`)
    }

    function validateYouTubeUrl(url) {
        if (url != undefined || url != '') {
            var regExpVideo = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})?$/;
            var matchVideo = url.match(regExpVideo);

            var regExpPlaylist = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|list\/|playlist\?list=|playlist\?.+&list=))((\w|-){34})?$/;
            var matchPlaylist = url.match(regExpPlaylist);

            if (matchVideo) {
                return "validVideo";
            }
            else if (matchPlaylist) {
                return "validPlaylist";
            }
            else {
                return "invalid";
            }
        }
    }

    async function getVideosFromPlaylist(url, nextPage = '') {
        var playlistId = url.split("https://www.youtube.com/playlist?list=").pop();
        const response = await got(`https://www.googleapis.com/youtube/v3/playlistItems?key=${youtube_token}&playlistId=${playlistId}&part=snippet&pageToken=${nextPage}&maxResults=50`);
        var searchRes = JSON.parse(response.body);

        for (var i = 0; i < searchRes.items.length; i++) {
            var videoId = searchRes.items[i].snippet.resourceId.videoId;

            await addToQueue(`https://www.youtube.com/watch?v=${videoId}`, true);
        }

        if (searchRes.nextPageToken != undefined) {
            await getVideosFromPlaylist(url, searchRes.nextPageToken)
        }
        else {
            const titleResponse = await got(`https://www.googleapis.com/youtube/v3/playlists?key=${youtube_token}&id=${playlistId}&part=snippet`);
            var titleSearchRes = JSON.parse(titleResponse.body);
            msg.channel.send(`Songs from **${titleSearchRes.items[0].snippet.title}** have been added to the queue.`)
        }
    }
}