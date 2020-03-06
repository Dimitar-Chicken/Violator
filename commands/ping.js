exports.run = (bot, prefix, msg, args) => {
  //A simple ping command that logs the delay in milliseconds.
  msg.channel.send(`pong \`${Date.now() - msg.createdTimestamp} ms\``);
}
