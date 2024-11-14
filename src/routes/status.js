const express = require('express');
const osUtils = require('os-utils');
const router = express.Router();
let prettyMs;

(async () => {
    prettyMs = (await import('pretty-ms')).default;
})();

router.get('/api/status', (req, res) => {
    osUtils.cpuUsage((cpuPercent) => {
        const statusData = {
            status: client.ws.status === 0 ? 'All Systems are Operational' : 'Offline',
            uptime: prettyMs ? prettyMs(client.uptime || 0) : 'N/A',
            cpuUsage: (cpuPercent * 100).toFixed(2),
            memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        };
        res.json(statusData);
    });
});

module.exports = router;
