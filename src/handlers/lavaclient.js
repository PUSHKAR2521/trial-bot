// lavaclient.js

const { Cluster } = require('lavaclient');
const { load, SpotifyItemType } = require('@lavaclient/spotify');
const prettyMs = require('pretty-ms');
const { EmbedBuilder } = require('discord.js');
require('@lavaclient/queue/register');

module.exports = (client) => {
  load({
    client: {
      id: process.env.SPOTIFY_CLIENT_ID,
      secret: process.env.SPOTIFY_CLIENT_SECRET,
    },
    autoResolveYoutubeTracks: true,
    loaders: [SpotifyItemType.Album, SpotifyItemType.Artist, SpotifyItemType.Playlist, SpotifyItemType.Track],
  });

  const lavaclient = new Cluster({
    nodes: client.config.MUSIC.LAVALINK_NODES,
    sendGatewayPayload: (id, payload) => {
      const guild = client.guilds.cache.get(id);
      if (guild) {
        guild.shard.send(payload);
      } else {
        console.error(`Guild with ID ${id} not found`);
      }
    },
  });

  client.ws.on('VOICE_SERVER_UPDATE', (data) => lavaclient.handleVoiceUpdate(data));
  client.ws.on('VOICE_STATE_UPDATE', (data) => lavaclient.handleVoiceUpdate(data));

  lavaclient.on('nodeConnect', (node) => {
    client.logger.log(`Node "${node.id}" connected`);
  });

  // Reconnection feature for disconnected nodes
  lavaclient.on('nodeDisconnect', (node) => {
    client.logger.log(`Node "${node.id}" disconnected. Attempting to reconnect...`);
    
    const reconnectInterval = setInterval(async () => {
      try {
        await node.connect(); // Attempt to reconnect
        client.logger.log(`Node "${node.id}" reconnected successfully`);
        clearInterval(reconnectInterval); // Stop trying once connected
      } catch (error) {
        client.logger.error(`Reconnection attempt for node "${node.id}" failed: ${error.message}`);
      }
    }, 5000); // Attempt to reconnect every 5 seconds
  });

  lavaclient.on('nodeError', (node, error) => {
    client.logger.error(`Node "${node.id}" encountered an error: ${error.message}`, error);
  });

  lavaclient.on('nodeDebug', (node, message) => {
    client.logger.debug(`Node "${node.id}" debug: ${message}`);
  });

  lavaclient.on('trackStart', (queue, track) => {
    let player = lavaclient.players.get(queue.guildId);
    if (!player) {
      player = lavaclient.createPlayer(queue.guildId);
      console.log('Player Created Successfully.');
    }

    const fields = [];
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Now Playing' })
      .setColor(client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`[${track.title}](${track.uri})`)
      .setFooter({ text: `Requested By: ${track.requester}` });

    if (track.sourceName === 'youtube') {
      const identifier = track.identifier;
      const thumbnail = `https://img.youtube.com/vi/${identifier}/hqdefault.jpg`;
      embed.setThumbnail(thumbnail);
    }

    fields.push({
      name: 'Song Duration',
      value: '`' + prettyMs(track.length, { colonNotation: true }) + '`',
      inline: true,
    });

    if (queue.tracks.length > 0) {
      fields.push({
        name: 'Position in Queue',
        value: (queue.tracks.length + 1).toString(),
        inline: true,
      });
    }

    embed.setFields(fields);
    queue.data.channel.safeSend({ embeds: [embed] });
  });

  lavaclient.on('queueFinish', async (queue) => {
    queue.data.channel.safeSend('Queue has ended.');
    await client.musicManager.destroyPlayer(queue.player.guildId);
    queue.player.disconnect();
  });

  lavaclient.on('playerCreate', (player) => {
    console.log(`Player created for guild ${player.guildId}`);
  });

  lavaclient.on('playerDestroy', (player) => {
    console.log(`Player destroyed for guild ${player.guildId}`);
  });

  lavaclient.on('ready', () => {
    console.log('Lavaclient is ready!!!');
  });

  return lavaclient;
};
