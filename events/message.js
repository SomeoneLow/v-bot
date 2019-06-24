module.exports.run = function(message) {
    // Check if message starts with prefix, is not sent by a bot and not in DMs
    if (!message.content.startsWith(this.config.prefix) || message.author.bot || !message.guild) return;

    // Define required properties
    Object.defineProperties(message, {
        command: {
            value: message.content.substr(this.config.prefix.length).split(" ")[0]
        },
        args: {
            value: message.content.split(" ").slice(1)
        }
    });

    // Check if command exists
    const command = this.commands.get(message.command);
    const configCommand = this.config.commands[message.command];
    if (!command) return;

    // Check if command is enabled
    if (command.enabled === false) return message.reply("⛔ | This command has been disabled.");

    // Check if author is allowed to execute command
    if (configCommand.executors.length > 0 && !configCommand.executors.includes(message.author.id))
        return message.reply("⛔ | You are not allowed to execute this command.");
    if (configCommand.requiredPermissions.length > 0 && !configCommand.requiredPermissions.some(v => message.member.hasPermission(v.toUpperCase())))
        return message.reply("⛔ | You are not allowed to execute this command.");

    // Check args length
    const requiredArgs = command.info.args.filter(v => v.required);
    if (message.args.length !== requiredArgs.length)
        return message.reply(`⛔ | Invalid arguments: ${requiredArgs.length} are needed but ${message.args.length} were provided.`);

    // Run command
    command.call(this, message);
};