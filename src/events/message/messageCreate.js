const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { PREFIX_COMMANDS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const UserNoPrefix = require("../../database/schemas/NoPrefix");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

  // command handler


  let isCommand = false;
        if (PREFIX_COMMANDS.ENABLED && message.content.startsWith(settings.prefix)) {
            const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
            const cmd = client.getCommand(invoke);
            if (cmd) {
                isCommand = true;
                commandHandler.handlePrefixCommand(message, cmd, settings);
            }
        } else {
            const userNoPrefix = await UserNoPrefix.findOne({ userId: message.author.id });
            if (userNoPrefix && userNoPrefix.noPrefixEnabled) {
                const invoke = message.content.split(/\s+/)[0].toLowerCase();
                const cmd = client.getCommand(invoke);
                if (cmd) {
                    isCommand = true;
                    commandHandler.handlePrefixCommand(message, cmd, settings);
                }
            }
        }

  // stats handler
  if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);

  // if not a command
  if (!isCommand) await automodHandler.performAutomod(message, settings);
};
