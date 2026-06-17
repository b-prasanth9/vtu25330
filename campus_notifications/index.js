const express = require('express');
const cors = require('cors');
const logger = require('./logger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

const NOTIFICATIONS = [
  { ID: 'd146095a-0d86-4a34-9e69-3900a14576bc', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:51:30' },
  { ID: 'b283218f-ea5a-4b7c-93a9-1f2f240d64b0', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18' },
  { ID: '81589ada-0ad3-4f77-9554-f52fb558e09d', Type: 'Event', Message: 'farewell', Timestamp: '2026-04-22 17:51:06' },
  { ID: '0005513a-142b-4bbc-8678-eefec65e1ede', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:50:54' },
  { ID: 'ea836726-c25e-4f21-a72f-544a6af8a37f', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:50:42' },
  { ID: '003cb427-8fc6-47f7-bb00-be228f6b0d2c', Type: 'Result', Message: 'external', Timestamp: '2026-04-22 17:50:30' },
  { ID: 'cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:49:54' },
  { ID: '8a7412bd-6065-4d09-8501-a37f11cc848b', Type: 'Placement', Message: 'Advanced Micro Devices Inc. hiring', Timestamp: '2026-04-22 17:49:42' }
];

const PRIORITY_MAP = {
  Placement: 3,
  Result: 2,
  Event: 1
};

class NotificationScheduler {
  constructor(notifications) {
    this.notifications = Array.isArray(notifications) ? notifications : [];
  }

  getPrioritySorted() {
    return this.notifications
      .slice()
      .sort((a, b) => {
        const priorityDiff = (PRIORITY_MAP[b.Type] || 0) - (PRIORITY_MAP[a.Type] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.Timestamp) - new Date(a.Timestamp);
      })
      .slice(0, 10);
  }
}

app.get('/notifications', (req, res) => {
  const limit = Number.isFinite(Number(req.query.limit)) && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const scheduler = new NotificationScheduler(NOTIFICATIONS);
  return res.json({ notifications: scheduler.getPrioritySorted(limit) });
});

app.get('/notifications/all', (req, res) => {
  return res.json({ notifications: NOTIFICATIONS });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Campus Notifications Service running on port ${PORT}`);
});
