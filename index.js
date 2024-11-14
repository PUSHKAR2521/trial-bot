require("dotenv").config();
require("module-alias/register");

// Register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

// Validate configuration
validateConfiguration();

// Initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// Find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

(async () => {
    // Check for updates
    await checkForUpdates();

    // Start the dashboard
    if (client.config.DASHBOARD.enabled) {
        client.logger.log("Launching dashboard");
        try {
            const { launch } = require("@root/dashboard/app");
            await launch(client);
        } catch (ex) {
            client.logger.error("Failed to launch dashboard", ex);
        }
    } else {
        // Initialize the database
        await initializeMongoose();
    }

    // Endpoint to get the bot status
    const express = require('express');
    const cors = require('cors');
    const path = require('path');
    const app = express();
    const ioClient = require('socket.io-client');
    const osUtils = require('os-utils');
    const socket = ioClient('https://officialbac-status.onrender.com/'); // Connect to dashboard server

    app.use(cors());
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views')); // Adjust the path if necessary

    // Import prettyMs dynamically
    let prettyMs;
    (async () => {
      prettyMs = (await import('pretty-ms')).default;
    })();

    // Emit bot status periodically
    setInterval(() => {
      osUtils.cpuUsage((cpuPercent) => {
        const statusData = {
          status: client.ws.status === 0 ? 'Online' : 'Offline',
          uptime: prettyMs ? prettyMs(client.uptime || 0) : 'N/A',
          cpuUsage: (cpuPercent * 100).toFixed(2),
          memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        };

        socket.emit('statusUpdate', statusData); // Send data to the dashboard

        // console.log("Status is", statusData);
      });
    }, 1000); // Update every 1 seconds

      // Start the client
      await client.login(process.env.BOT_TOKEN);
  })();

module.exports = client; // Add this line at the end of the file
