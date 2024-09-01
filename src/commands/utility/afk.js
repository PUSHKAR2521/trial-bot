const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const afkSchema = require("../../database/schemas/AfkSchema");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "afk",
  description: "Go AFK within your server.",
  cooldown: 0,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  userPermissions: [],

  command: {
    enabled: true,
    aliases: [],
    usage: "set <reason> | remove",
    minArgsCount: 1,
  },

  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "action",
        description: "Select an action",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "Set AFK",
            value: "set",
          },
          {
            name: "Remove AFK",
            value: "remove",
          },
        ],
      },
      {
        name: "reason",
        description: "Reason for going AFK",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
 // add yourself lmao
},

  async interactionRun(interaction, data) {
    const { options, guild, user, member } = interaction;
    const subcommand = options.getString('action');

    switch (subcommand) {
      case 'set':
        const reason = options.getString('reason') || 'No reason given!';
        const nickname = member.nickname || user.username;

        const existingData = await afkSchema.findOne({ Guild: guild.id, User: user.id });
        if (existingData) {
          return await interaction.followUp({
            content: `You are **already** AFK within this server!`,
            ephemeral: true
          });
        }

        await afkSchema.create({
          Guild: guild.id,
          User: user.id,
          Message: reason,
          Nickname: nickname
        });

        const name = `[AFK] ${nickname}`;
        await member.setNickname(name).catch(err => {
          return;
        });

        const embedSet = new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle(`${user.username} has Gone Afk`)
          .setDescription(`> **Reason**: ${reason}`)
          .setAuthor({ name: "Afk Machine", iconURL: user.displayAvatarURL() })
          .setTimestamp();

        await interaction.followUp({
          content: `You are now **AFK**! \n> Do **/afk action remove** or type something in the chat to undo.`,
          ephemeral: true
        });
        interaction.channel.send({ embeds: [embedSet] });
        break;

      case 'remove':
        const dataToRemove = await afkSchema.findOne({ Guild: guild.id, User: user.id });
        if (!dataToRemove) {
          return await interaction.followUp({
            content: `You are **not** AFK, can't remove **nothing**..`,
            ephemeral: true
          });
        }

        const originalNickname = dataToRemove.Nickname;
        await afkSchema.deleteMany({ Guild: guild.id, User: user.id });

        await member.setNickname(originalNickname).catch(err => {
          return;
        });

        const embedRemove = new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle(`${user.username} has returned from being AFK`)
          .setDescription(`> ${user.username} is back, say hi 👋`)
          .setAuthor({ name: "Afk Machine", iconURL: user.displayAvatarURL() })
          .setTimestamp();

        await interaction.followUp({
          content: `You are **no longer** AFK! Welcome back :)`,
          ephemeral: true
        });
        interaction.channel.send({ embeds: [embedRemove] });
        break;

      default:
        await interaction.followUp({
          content: "Invalid subcommand provided.",
          ephemeral: true
        });
        break;
    }
  },
};