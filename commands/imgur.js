exports.run = async (bot, msg, args, db) => {

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
  
  switch (args[0]) {
    case "subreddit"://When the user requests a search by subreddit, this case is built with the appropriate URL and searchText.
      searchQuery = args.slice(2)
      searchURL = `https://api.imgur.com/3/gallery/r/${args[1]}/${searchQuery}`;
      searchedText = `subreddit: ${args[1]} | query: ${searchQuery}`;
      break;

    case "tag"://When the user requests a search by tag, this case is built with the appropriate URL and searchText.
      searchURL = `https://api.imgur.com/3/gallery/t/${args[1]}`;
      searchedText = `tag: ${args[1]}`;
      break;
    
    default://The default search case is used when the user doesn't request search by subreddit or tag.
      searchQuery = args.join('+');
      searchURL = `https://api.imgur.com/3/gallery/search/?q=${searchQuery}`;
      searchedText = `${searchQuery}`;
  }

  //Options with our URL and imgur auth client-id.
  const options = {
    url: searchURL,
    headers: {
      //Authorization token for the imgur API.
      'Authorization': `Client-ID ${settings.imgur_client_id}`
    }
  }

  //Checks that args are added to the command call.
  if (args[0] == undefined) {
    msg.channel.send(`Incorrect usage. \`${prefix}${commands['Imgur'].syntax}\``);
    return;
  }


  //Deletes the command message so as to avoid chat cluttering, purely cosmetic.
  await msg.delete();
  //GET request with options.
  await request(options, (err, res, body) => {
    //Checks if there was an error and if the status code is 200(OK).
    if (!err && res.statusCode == 200) {

      
      //Parses the request body string to a JSON format.
      var searchRes = JSON.parse(body);
      //Checks if any data was received in the result, cancels operation if no results were found.
      if (searchRes.data.length == 0) {
        //If not logs that no results were received from the API.
        console.log(`No return for search: ${searchedText}`);
        //Also notifies the channel that there were no results.
        msg.channel.send(`No results found for: \`${searchedText}\``);
        return;
      }

      //Variable to store the randomly generated number.
      var randNum;
      //Logs progress to console.
      console.log("Posting random result...\n");

      //
      // TODO: Create and integrate parser for this, might be better.
      //

      //Since the JSON returned by the API for a tag search is slightly different the messages need to be refactored 
      if (searchedText.startsWith("tag")) {
        //Generates a random number no larger than the size of the data collection (or number of posts in this instance).
        randNum = Math.floor(Math.random() * (searchRes.data.items.length - 1));
        //Posts the message to the channel.
        msg.channel.send(`Result for: \`${searchedText}\` \n${searchRes.data.items[randNum].link}`);
      }
      else {
        //Generates a random number no larger than the size of the data collection (or number of posts in this instance).
        randNum = Math.floor(Math.random() * (searchRes.data.length - 1));
        //Posts the message to the channel.
        msg.channel.send(`Result for: \`${searchedText}\` \n${searchRes.data[randNum].link}`);
      }
    }
  });
}
