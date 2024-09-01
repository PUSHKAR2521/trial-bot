const { EmbedBuilder } = require("discord.js");
const { Cluster } = require("lavaclient");
const prettyMs = require("pretty-ms");
const { load, SpotifyItemType } = require("@lavaclient/spotify");
require("@lavaclient/queue/register");

/**
 * @param {import("@structures/BotClient")} client
 */
module.exports = (client) => {
  load({
    client: {
      id: process.env.SPOTIFY_CLIENT_ID,
      secret: process.env.SPOTIFY_CLIENT_SECRET,
    },
    autoResolveYoutubeTracks: false,
    loaders: [SpotifyItemType.Album, SpotifyItemType.Artist, SpotifyItemType.Playlist, SpotifyItemType.Track],
  });

  const lavaclient = new Cluster({
    nodes: client.config.MUSIC.LAVALINK_NODES,
    sendGatewayPayload: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
  });

  client.ws.on("VOICE_SERVER_UPDATE", (data) => lavaclient.handleVoiceUpdate(data));
  client.ws.on("VOICE_STATE_UPDATE", (data) => lavaclient.handleVoiceUpdate(data));

  lavaclient.on("nodeConnect", (node) => {
    client.logger.log(`Node "${node.id}" connected`);
  });

  lavaclient.on("nodeDisconnect", (node) => {
    client.logger.log(`Node "${node.id}" disconnected`);
  });

  lavaclient.on("nodeError", (node, error) => {
    client.logger.error(`Node "${node.id}" encountered an error: ${error.message}`, error);
  });

  lavaclient.on("nodeDebug", (node, message) => {
    client.logger.debug(`Node "${node.id}" debug: ${message}`);
  });

  lavaclient.on("trackStart", (queue, track) => {
    const fields = [];

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Now Playing" })
      .setColor(client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`[${track.title}](${track.uri})`)
      .setFooter({ text: `Requested By: ${track.requester}` });

    if (track.sourceName === "youtube") {
      const identifier = track.identifier;
      const thumbnail = `https://img.youtube.com/vi/${identifier}/hqdefault.jpg`;
      embed.setThumbnail(thumbnail);
    }

    fields.push({
      name: "Song Duration",
      value: "`" + prettyMs(track.length, { colonNotation: true }) + "`",
      inline: true,
    });

    if (queue.tracks.length > 0) {
      fields.push({
        name: "Position in Queue",
        value: (queue.tracks.length + 1).toString(),
        inline: true,
      });
    }

    embed.setFields(fields);
    queue.data.channel.safeSend({ embeds: [embed] });
  });

  lavaclient.on("queueFinish", async (queue) => {
    queue.data.channel.safeSend("Queue has ended.");
    await client.musicManager.destroyPlayer(queue.player.guildId);
    queue.player.disconnect();
  });

//   return lavaclient;
// };

// lavaclient.js

// const { Cluster } = require('lavaclient');
// const { load, SpotifyItemType } = require('@lavaclient/spotify');
// const prettyMs = require('pretty-ms');
// const { EmbedBuilder } = require('discord.js');

// module.exports = (client) => {
//   load({
//     client: {
//       id: process.env.SPOTIFY_CLIENT_ID,
//       secret: process.env.SPOTIFY_CLIENT_SECRET,
//     },
//     autoResolveYoutubeTracks: true,
//     loaders: [SpotifyItemType.Album, SpotifyItemType.Artist, SpotifyItemType.Playlist, SpotifyItemType.Track],
//   });

//   const lavaclient = new Cluster({
//     nodes: client.config.MUSIC.LAVALINK_NODES,
//     sendGatewayPayload: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
//   });

//   client.ws.on('VOICE_SERVER_UPDATE', (data) => lavaclient.handleVoiceUpdate(data));
//   client.ws.on('VOICE_STATE_UPDATE', (data) => lavaclient.handleVoiceUpdate(data));

//   lavaclient.on('nodeConnect', (node) => {
//     client.logger.log(`Node "${node.id}" connected`);
//   });

//   lavaclient.on('nodeDisconnect', (node) => {
//     client.logger.log(`Node "${node.id}" disconnected`);
//   });

//   lavaclient.on('nodeError', (node, error) => {
//     client.logger.error(`Node "${node.id}" encountered an error: ${error.message}`, error);
//   });

//   lavaclient.on('nodeDebug', (node, message) => {
//     client.logger.debug(`Node "${node.id}" debug: ${message}`);
//   });

//   lavaclient.on('trackStart', (queue, track) => {
//     const fields = [];
//     const embed = new EmbedBuilder()
//       .setAuthor({ name: 'Now Playing' })
//       .setColor(client.config.EMBED_COLORS.BOT_EMBED)
//       .setDescription(`[${track.title}](${track.uri})`)
//       .setFooter({ text: `Requested By: ${track.requester}` });

//     if (track.sourceName === 'youtube') {
//       const identifier = track.identifier;
//       const thumbnail = `https://img.youtube.com/vi/${identifier}/hqdefault.jpg`;
//       embed.setThumbnail(thumbnail);
//     }

//     fields.push({
//       name: 'Song Duration',
//       value: '`' + prettyMs(track.length, { colonNotation: true }) + '`',
//       inline: true,
//     });

//     if (queue.tracks.length > 0) {
//       fields.push({
//         name: 'Position in Queue',
//         value: (queue.tracks.length + 1).toString(),
//         inline: true,
//       });
//     }

//     embed.setFields(fields);
//     queue.data.channel.safeSend({ embeds: [embed] });
//   });

//   lavaclient.on('queueFinish', async (queue) => {
//     queue.data.channel.safeSend('Queue has ended.');
//     await client.musicManager.destroyPlayer(queue.player.guildId);
//     queue.player.disconnect();
//   });

  lavaclient.getCurrentSong = (guildId) => {
    const player = lavaclient.players.get(guildId);
    if (player && player.queue.current) {
      return player.queue.current;
    }
    return null;
  };

  // Debugging code
  lavaclient.on('playerCreate', (player) => {
    console.log(`Player created for guild ${player.guildId}`);
  });

  lavaclient.on('playerDestroy', (player) => {
    console.log(`Player destroyed for guild ${player.guildId}`);
  });

  return lavaclient;
};
