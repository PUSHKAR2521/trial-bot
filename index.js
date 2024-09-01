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
    const BOT_STATUS_PORT = process.env.BOT_STATUS_PORT || 3001; // Port for bot status

    app.use(cors());
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views')); // Adjust the path if necessary

    // Endpoint to get the bot status
    app.get('/bot-status', (req, res) => {
        if (client.ws.status === 0) { // 0 means the bot is ready
            res.json({ status: 'Online' });
        } else {
            res.json({ status: 'Offline' });
        }
    });

    // Start the servers
    app.listen(BOT_STATUS_PORT, () => {
        client.logger.log(`Bot status server is running on port ${BOT_STATUS_PORT}`);
    });

    // Start the client
    await client.login(process.env.BOT_TOKEN);
})();

module.exports = client; // Add this line at the end of the file
