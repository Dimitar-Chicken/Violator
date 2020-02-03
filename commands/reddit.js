exports.run = (bot, msg, args, db) => {
  // TODO: Implement reddit API search and all the other shit that comes with it.

  //Finds the settings file for future token obtaining.
  const settings = require('./../settings.json');
  //File system import.
  const fs = require('fs');
  //Imports the command information file.
  const commands = JSON.parse(fs.readFileSync('./commands/commands.json', 'utf8'));
  //Retrieves the prefix from the DB
  const prefix = db.get(`servers.${msg.guild.id}_prefix`).value();

  //Request package to handle our HTTPS requests.
  const request = require('request');
  let searchQuery;
  let searchedText;
  let searchURL;
  let subreddit = null;

  console.log(args[0])
  switch (args[0]) {
    case "subreddit": //Searches within a specific subreddit.
      //Saves the subreddit name in a variable for future use.
      subreddit = args[1];
      //Copies the search query arguments from the array and joins them with '+'.
      searchQuery = args.slice(2, ).join('+');
      searchURL = `https://www.reddit.com/r/${subreddit}/search.json?q=${searchQuery}&restrict_sr=on`;
      searchedText = `${searchQuery}`;
      break;

    default: //Default search is by a search query
      searchQuery = args.join('+');
      searchURL = `https://www.reddit.com/search.json?q=${searchQuery}`;
      searchedText = `${searchQuery}`;
  }

  //Options with our URL and reddit auth client-id.
  const options = {
    url: searchURL,
    headers: {
      //Authorization token for the reddit API.
      'Authorization': `Client-ID ${settings.reddit_client_id}`
    }
  }

  //Checks that args are added to the command call.
  if (args[0] == undefined) {
    msg.channel.send(`Incorrect usage. \`${prefix}${commands['Reddit'].syntax}\``);
    return;
  }

  //Deletes the command message so as to avoid chat cluttering, purely cosmetic.
  await msg.delete();
  //GET request with options.
  request(options, (err, res, body) => {
    //Checks if there was an error and if the status code is 200(OK).
    if (!err && res.statusCode == 200) {

      //Parses the request body string to a JSON format.
      var searchRes = JSON.parse(body);

      //Checks if any data was received in the result, cancels operation if no results were found.
      if (searchRes.data.children.length == 0) {
        //If not logs that no results were received from the API.
        console.log(`No return for search query: ${searchQuery}, ${subreddit}`);
        //Also notifies the channel that there were no results.
        if (subreddit != null) {
          msg.channel.send(`No results found for: \`${searchQuery} in r/${subreddit}\``);
        } else {
          msg.channel.send(`No results found for: \`${searchQuery}\``);
        }
        return;
      }

      var randNum;
      //Logs progress to console.
      console.log("Posting random result...\n");

      //
      // TODO: Create and integrate parser for this, might be better.
      //

      //Since the JSON returned by the API for a tag search is slightly different the messages need to be refactored 
      if (subreddit != null) {
        //Generates a random number no larger than the size of the data collection (or number of posts in this instance).
        randNum = Math.floor(Math.random() * (searchRes.data.children.length - 1));
        //Posts the message to the channel.
        msg.channel.send(`Result for: \`subreddit: r/${subreddit}, query: ${searchedText}\` \nhttps://reddit.com${searchRes.data.children[randNum].data.permalink}`);
      } else {
        //Generates a random number no larger than the size of the data collection (or number of posts in this instance).
        randNum = Math.floor(Math.random() * (searchRes.data.children.length - 1));
        //Posts the message to the channel.
        msg.channel.send(`Result for: \`${searchedText}\` \nhttps://reddit.com/${searchRes.data.children[randNum].data.permalink}`);
      }
    }
  });
}