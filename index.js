require("dotenv").config();

require("module-alias/register");


const path = require('path');
const ioClient = require('socket.io-client');
const cors = require('cors');
const osUtils = require('os-utils');
const socket = ioClient('https://officialbac-status.onrender.com/'); // Connect to dashboard server

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

  // start the client

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
  }, 1000); // Update every 5 seconds

  await client.login(process.env.BOT_TOKEN);

})();

