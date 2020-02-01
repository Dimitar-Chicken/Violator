exports.run = (bot, msg, args) => {
  //A simple ping command that logs the delay in milliseconds.
  msg.channel.send(`pong \`${Date.now() - msg.createdTimestamp} ms\``);
}
