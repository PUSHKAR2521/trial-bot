require("dotenv").config();

require("module-alias/register");



// register extenders

require("@helpers/extenders/Message");

require("@helpers/extenders/Guild");

require("@helpers/extenders/GuildChannel");



const { checkForUpdates } = require("@helpers/BotUtils");

const { initializeMongoose } = require("@src/database/mongoose");

const { BotClient } = require("@src/structures");

const { validateConfiguration } = require("@helpers/Validator");



validateConfiguration();



// initialize client

const client = new BotClient();

client.loadCommands("src/commands");

client.loadContexts("src/contexts");

client.loadEvents("src/events");



// find unhandled promise rejections

process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));



(async () => {

  // check for updates

  await checkForUpdates();



  // start the dashboard

  if (client.config.DASHBOARD.enabled) {

    client.logger.log("Launching dashboard");

    try {

      const { launch } = require("@root/dashboard/app");



      // let the dashboard initialize the database

      await launch(client);

    } catch (ex) {

      client.logger.error("Failed to launch dashboard", ex);

    }

  }

    else {

    // initialize the database

    await initializeMongoose();

  }

// Endpoint to get the bot status
const express = require('express');
const cors = require('cors');
const app = express();
const BOT_PORT = process.env.BOT_STATUS_PORT; // Use a different port to avoid conflict with the dashboard

app.use(cors());

app.get('/bot-status', (req, res) => {
  if (client.ws.status === 0) { // 0 means the bot is ready
    res.json({ status: 'Online' });
  } else {
    res.json({ status: 'Offline' });
  }
});

app.listen(BOT_PORT, () => {
  client.logger.log(`Bot status server is running on port ${BOT_PORT}`);
  client.logger.log(`Site Link : http://localhost:8888/`);
});



  // start the client

  await client.login(process.env.BOT_TOKEN);

})();

