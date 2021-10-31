const { readdirSync } = require("fs");
const util = require("../util.js");

// Note: The :white_check_mark: emoji is \u2705 in unicode.
//       I will have to use that, as my text editor doesn't support adding
//       emoji's straight to the code.

function check_permissions(member, command_info) {
    // If a command requires the user to be in the High Command, check if they have the
    // required High Command role.
    if (command_info.requires_hc) {
        if (member.roles.cache.find(role => role.id == process.env.HC_ROLE_ID_POLICE) != undefined || member.roles.cache.find(role => role.id == process.env.HC_ROLE_ID_AMBULANCE) != undefined) {
            return true;
        }
    } else {
        // We don't require a High Command role, so we're allowed to execute this command.
        // Although we might still not be able to execute the command, depending on if the command
        // can only be executed in a specific channel.
        return true;
    }

    return false;
}

exports.fire = (client, message) => {
    if (message.author.bot) return;             // Don't respond to bots, only to actual users.
    if (!message.guild) return;                 // The message has not been sent in a guild.
    if (!message.guild.available) return;       // Only read messages if this server is available. If it's not, there might be a server outrage.
    if (message.channel.type != "text") return; // Only try to use commands if it is actually used in a server.
  
    // Only process messages starting with the prefix. This way we ensure we're only
    // processing commands.
    if (message.content.startsWith(process.env.PREFIX)) { 
        const command = message.content.split(process.env.PREFIX)[1] // Use everything after the prefix.
                                       .split(" ")[0];          // Remove everything after a space.
                                                                // A space indicates the word has ended,
                                                                // and thus the command name ends there aswell.

        // Now we search for the file in the commands directory, and if it's there, the command
        // exists and is valid. The file will contain information about the kind of permission
        // needed to execute the command, and so we have to load the file first.

        const commands = readdirSync(`${__dirname}/../commands/`);

        for (const file of commands) {
            const command_name = file.split(".")[0];

            if (command_name == command) {
                const command_file = require(`${__dirname}/../commands/${file}`);

                let args = message.content.split(" ") // Split the message using a space. Because of this, it should only contain words.
                                          .slice(1);  // Remove the first word, as it is in the command itself.

                if (check_permissions(message.member, command_file.info)) {
                    // If this command can only be used in a specific channel, check
                    // if the user is allowed to execute the command there. If not,
                    // inform the user, and stop processing this message.
                    if (command_file.info.channel_data.channel_locked && message.channel.id != command_file.info.channel_data.channel_id_police && message.channel.id != command_file.info.channel_data.channel_id_ambulance) {
                        message.reply(`This command cannot be used in this channel! Please, move to the designated channel!`);

                        message.react("\u26A0"); // :warning:
                      
                        return;
                    }

                    // Ensure the message has not been processed before.
                    if (message.reactions.cache.has(_client => _client === client)) return;
                  
                    // Everything has been checked, and we're allowed to execute the command,
                    // and we're in the appropiate location. Now, actually execute the
                    // command. The command has been wrapped inside a try-catch block,
                    // to catch errors happening inside the commands.

                    const channel_category = message.channel.parent.type == "category";
                    const is_police = message.channel.parent.id == "493820162529689603";

                    if (!is_police && message.channel.parent.id != "577605423922675752") {
                        message.reply("The bot only works in a channel that is located in the Ambulance or Police categories.");
                        
                        message.react("\u26A0"); // :warning:
                      
                        return;
                    }

                    try {
                        command_file.execute(client, message, args, is_police);
                    } catch(error) {
                        util.process_error(error);
                    }
                } else {
                    message.reply("You are not allowed to use that command, because it is locked to the High Command only.");
                  
                    message.react("\u26A0"); // :warning:
                }
            }
        }
    }
}
