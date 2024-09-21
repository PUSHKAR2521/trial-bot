const express = require("express");
const CheckAuth = require("../auth/CheckAuth");
const mongoose = require('mongoose');
const Status = require('../models/statusModel'); // Ensure this model is correctly defined
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const prettyMs = require('pretty-ms'); // Ensure you have pretty-ms installed
require("dotenv").config();
const client = require('@root/index');
const lavaclient = require('@handlers/lavaclient')(client); // Ensure this returns the lavaclient instance
require('@lavaclient/queue/register');

const router = express.Router();

// Connect to MongoDB
const connectionString = process.env.MONGO_CONNECTION;
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Background status monitoring
const checkInterval = 3600000; // Check every 1 hour

setInterval(async () => {
  try {
    const dashboardStatus = await checkDashboardStatus();
    const botStatus = await checkBotStatus();

    // Log the statuses with the current date and time
    await logStatus(dashboardStatus, botStatus);
  } catch (error) {
    console.error('Error in status monitoring:', error);
  }
}, checkInterval);

// Route handlers
router.get("/selector", CheckAuth, (req, res) => {
  res.render("selector", {
    user: req.userInfos,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
  });
});

router.get('/', (req, res) => res.render('home'));
router.get('/about', (req, res) => res.render('about'));
router.get('/features', (req, res) => res.render('features'));
router.get('/features1', (req, res) => res.render('features1'));
router.get('/soon', (req, res) => res.render('comingsoon'));
router.get('/privacy', (req, res) => res.render('privacypolicy'));
router.get('/terms', (req, res) => res.render('termscondition'));
router.get('/legal', (req, res) => res.render('legalnotice'));
router.get('/index', (req, res) => res.render('index'));
router.get('/invite', (req, res) => res.redirect('https://discord.com/oauth2/authorize?client_id=1178318128430731264'));
router.get('/serverinvite', (req, res) => res.redirect('https://discord.gg/gmDUbQ56py'));
router.get('/youtube', (req, res) => res.redirect('https://www.youtube.com/@b.a.c_gaming'));
router.get('/instagram', (req, res) => res.redirect('https://www.instagram.com/b.a.c_gaming_/'));

// Route handler for music
router.get('/music', async (req, res) => {
  try {
    const guildId = req.query.guildId;

    if (!guildId) {
      return res.status(400).json({ error: 'Guild ID is required' });
    }

    // Ensure lavaclient is correctly initialized
    if (!lavaclient || !lavaclient.players) {
      return res.status(500).json({ error: 'LavaClient or players not initialized' });
    }

    const player = lavaclient.players.get(guildId);

    if (!player) {
      return res.status(404).json({ error: 'No player found for this guild' });
    }

    const currentSong = player.queue.current || { title: 'Nothing playing', artist: '' };
    res.json({
      currentSong: {
        title: currentSong.title,
        artist: currentSong.author
      },
      queue: player.queue.slice(0, 10).map(song => ({
        id: song.identifier,
        title: song.title,
        artist: song.author
      })),
      volume: player.volume,
      bassBoost: player.filters.bassboost // Example, adjust based on your implementation
    });
  } catch (error) {
    console.error('Error handling /music route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to render the status page
router.get('/status', async (req, res) => {
  try {
    // Get unique dates for dropdown menu
    const uniqueDates = await Status.aggregate([
      {
        $project: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "+00:00" }
          }
        }
      },
      {
        $group: {
          _id: "$date"
        }
      },
      {
        $sort: { _id: -1 } // Sort dates in descending order
      }
    ]).exec();

    // Format dates for dropdown
    const dateOptions = uniqueDates.map(date => date._id);

    // Create a date filter based on the selected date
    const selectedDate = req.query.date || '';
    const dateFilter = selectedDate ? {
      timestamp: {
        $gte: new Date(new Date(selectedDate).toISOString().split('T')[0] + 'T00:00:00+00:00'),
        $lt: new Date(new Date(selectedDate).toISOString().split('T')[0] + 'T23:59:59+00:00')
      }
    } : {};

    // Load the logged data from MongoDB based on selected date
    const statusEntries = await Status.find(dateFilter).sort({ timestamp: -1 }).limit(100).exec();

    // Get the latest status entry
    const latestStatus = statusEntries.length > 0 ? statusEntries[0] : { dashboardStatus: 'Offline', botStatus: 'Offline' };

    res.render('status', { 
      statusEntries, 
      dates: dateOptions, 
      selectedDate,
      dashboardStatus: latestStatus.dashboardStatus,
      botStatus: latestStatus.botStatus
    });
  } catch (error) {
    console.error('Error in /status route:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to get status information for a specific date
router.get('/status-info', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const statusEntry = await Status.findOne({ timestamp: { $gte: new Date(date + 'T00:00:00Z'), $lt: new Date(date + 'T23:59:59Z') } }).sort({ timestamp: -1 }).exec();

    if (!statusEntry) return res.status(404).json({ status: 'Unknown', downtime: '' });

    // Calculate downtime if the status is 'Down'
    const downtime = statusEntry.botStatus === 'Down' ? prettyMs(Date.now() - new Date(statusEntry.timestamp)) : '';

    res.json({
      status: statusEntry.botStatus,
      downtime
    });
  } catch (error) {
    console.error('Error fetching status info:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to log status to MongoDB
async function logStatus(dashboardStatus, botStatus) {
  const newStatus = new Status({
    timestamp: new Date(), // Save in UTC
    dashboardStatus,
    botStatus,
  });
  await newStatus.save();
}

// Function to check dashboard status
async function checkDashboardStatus() {
  try {
    const response = await fetch('http://localhost:8888'); // Adjust URL as needed
    return response.ok ? 'Online' : 'Offline';
  } catch (error) {
    console.error('Error checking dashboard status:', error);
    return 'Offline';
  }
}

// Function to check bot status
async function checkBotStatus() {
  try {
    const response = await fetch('http://localhost:3001/bot-status'); // Adjust URL as needed
    if (response.ok) {
      const data = await response.json();
      return data.status; // Adjust according to your bot status response
    } else {
      return 'Offline';
    }
  } catch (error) {
    console.error('Error checking bot status:', error);
    return 'Offline';
  }
}

module.exports = router;
