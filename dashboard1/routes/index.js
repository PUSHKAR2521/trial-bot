const express = require("express"),
  CheckAuth = require("../auth/CheckAuth"),
  router = express.Router();
const app = express();

router.get("/selector", CheckAuth, async (req, res) => {
  res.render("selector", {
    user: req.userInfos,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
  });
});

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/features', (req, res) => {
  res.render('features');
});

router.get('/soon', (req, res) => {
  res.render('comingsoon');
});

// Route to render the status page
app.get('/status', async (req, res) => {
  const dashboardStatus = await checkDashboardStatus();
  const botStatus = await checkBotStatus();

  res.render('status', { dashboardStatus, botStatus });
});

// Function to check dashboard status
async function checkDashboardStatus() {
  try {
    const response = await fetch('http://localhost:8888'); // Adjust URL as needed
    if (response.ok) {
      return 'Online';
    } else {
      return 'Offline';
    }
  } catch (error) {
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
    return 'Offline';
  }
}

module.exports = router;
