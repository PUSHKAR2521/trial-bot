const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { timeformat } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "uptime",
  description: "gives you bot uptime",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },


  async messageRun(message, args) {
    try {
      const uptime = timeformat(process.uptime());

      const embed = new EmbedBuilder()
        .setColor("#00FF00") // Set the color of the embed
        .setTitle("Mera Work Time") // Set the title of the embed
        .setDescription(`<:alarm_clock:1267421302277537944> | Mera Overtime : \`${uptime}\``) // Set the description of the embed
        .setTimestamp(); // Optional: Set the timestamp to the current time

      await message.reply({ embeds: [embed] }); // Use reply method from discord.js

    } catch (error) {
      console.error("An error occurred while running the command:", error);
      await message.reply("An error occurred while running this command. Please try again later.");
    }
  },
};