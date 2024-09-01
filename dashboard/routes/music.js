const express = require('express');
const router = express.Router();
const lavaclient = require('@src/handlers/lavaclient'); // Ensure this path is correct

// Middleware to check authentication
router.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/discord');
  }
  next();
});

// Route to render the music page
router.get('/', (req, res) => {
  try {
    console.log('Rendering music page for user:', req.user); // Debug log
    res.render('music', { user: req.user });
  } catch (error) {
    console.error('Error rendering music page:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to get current song and queue info
router.get('/api/music', async (req, res) => {
  const guildId = req.query.serverID;
  console.log("Guild ID:", guildId); // Debug log

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID is required' });
  }

  const player = lavaclient.players.get(guildId);
  console.log("Player:", player); // Debug log

  if (!player) {
    return res.status(404).json({ error: 'No player found for this guild' });
  }

  const currentSong = player.queue.current || { title: 'Nothing playing', artist: '' };
  const queue = player.queue.slice(0, 10); // Limit to top 10 songs

  res.json({
    currentSong: {
      title: currentSong.title,
      artist: currentSong.author || 'Unknown' // Fallback in case 'author' is undefined
    },
    queue: queue.map(song => ({
      id: song.identifier,
      title: song.title,
      artist: song.author || 'Unknown' // Fallback in case 'author' is undefined
    })),
    volume: player.volume,
    bassBoost: player.filters.bassboost // Example, adjust based on your implementation
  });
});

// Route to add a song to the queue
router.post('/api/music/queue/add', (req, res) => {
  const { url, guildId } = req.body;

  if (!url || !guildId) {
    return res.status(400).json({ error: 'URL and Guild ID are required' });
  }

  const player = lavaclient.players.get(guildId);

  if (!player) {
    return res.status(404).json({ error: 'No player found for this guild' });
  }

  try {
    player.queue.add(url); // Ensure your lavaclient supports this method
    res.json({ success: true });
  } catch (error) {
    console.error(`Error adding song to queue: ${error.message}`, error);
    res.status(500).json({ error: 'Failed to add song to queue' });
  }
});

// Route to remove a song from the queue
router.post('/api/music/queue/remove', (req, res) => {
  const { songId, guildId } = req.body;

  if (!songId || !guildId) {
    return res.status(400).json({ error: 'Song ID and Guild ID are required' });
  }

  const player = lavaclient.players.get(guildId);

  if (!player) {
    return res.status(404).json({ error: 'No player found for this guild' });
  }

  try {
    player.queue.remove(songId); // Ensure your lavaclient supports this method
    res.json({ success: true });
  } catch (error) {
    console.error(`Error removing song from queue: ${error.message}`, error);
    res.status(500).json({ error: 'Failed to remove song from queue' });
  }
});

// Route to set volume
router.post('/api/music/volume', (req, res) => {
  const { volume, guildId } = req.body;

  if (!volume || !guildId) {
    return res.status(400).json({ error: 'Volume and Guild ID are required' });
  }

  const player = lavaclient.players.get(guildId);

  if (!player) {
    return res.status(404).json({ error: 'No player found for this guild' });
  }

  try {
    player.setVolume(volume);
    res.sendStatus(200);
  } catch (error) {
    console.error(`Error setting volume: ${error.message}`, error);
    res.status(500).json({ error: 'Failed to set volume' });
  }
});

// Route to set bass boost
router.post('/api/music/bassboost', (req, res) => {
  const { bassBoost, guildId } = req.body;

  if (bassBoost === undefined || !guildId) {
    return res.status(400).json({ error: 'Bass boost and Guild ID are required' });
  }

  const player = lavaclient.players.get(guildId);

  if (!player) {
    return res.status(404).json({ error: 'No player found for this guild' });
  }

  try {
    player.setBassBoost(bassBoost); // Adjust based on your implementation
    res.sendStatus(200);
  } catch (error) {
    console.error(`Error setting bass boost: ${error.message}`, error);
    res.status(500).json({ error: 'Failed to set bass boost' });
  }
});

module.exports = router;
