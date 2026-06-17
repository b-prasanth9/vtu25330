const express = require('express');
const cors = require('cors');
const logger = require('./logger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

const DEPOTS = [
  { ID: 1, MechanicHours: 60 },
  { ID: 2, MechanicHours: 135 },
  { ID: 3, MechanicHours: 188 },
  { ID: 4, MechanicHours: 97 },
  { ID: 5, MechanicHours: 164 }
];

const VEHICLES = [
  { TaskID: '18c655b2-380d-4295-8905-863f0de32c8f', Duration: 2, Impact: 9 },
  { TaskID: '436e87a6-2b5b-42b9-9c35-deaa2c8ef54e', Duration: 2, Impact: 3 },
  { TaskID: '0a823f1b-03c3-4722-af40-e17a7b9ee0ff', Duration: 2, Impact: 5 },
  { TaskID: '0bf780cb-1099-4f61-99bf-dec95a7063b6', Duration: 3, Impact: 10 },
  { TaskID: 'e716fb11-1064-4db7-9d76-06d19f4f6f67', Duration: 5, Impact: 5 },
  { TaskID: '60586e47-ab9c-407d-85ca-1215084f3f41', Duration: 8, Impact: 8 },
  { TaskID: '1d893de7-fbba-4c77-927b-e3076fe805d5', Duration: 1, Impact: 8 },
  { TaskID: '1743e1b5-9dfd-450b-9905-98c3e054aee1', Duration: 5, Impact: 8 },
  { TaskID: '48851915-eaf5-48ec-a20c-5074d7050c5f', Duration: 8, Impact: 8 },
  { TaskID: '7d81e6ca-8f03-4c4a-9ec0-701f820c5655', Duration: 7, Impact: 8 },
  { TaskID: '08d00114-9506-463d-ba2e-3343ec4e2e89', Duration: 6, Impact: 6 },
  { TaskID: 'a1e0b8e6-1076-4a2f-b83b-5e6017900033', Duration: 6, Impact: 1 },
  { TaskID: '52635341-7c5f-475a-9839-4676f8fe5fd4', Duration: 1, Impact: 5 },
  { TaskID: '9e08defa-7bb5-4a83-9e29-417165922894', Duration: 6, Impact: 9 },
  { TaskID: 'f92b0f39-35ec-47c3-a465-3e49c22185b6', Duration: 2, Impact: 5 },
  { TaskID: '65c0d74a-82ef-4fcc-9d85-9b082bb85310', Duration: 5, Impact: 7 },
  { TaskID: '73ce9dca-1536-4a7a-9f1e-c67083afad61', Duration: 6, Impact: 2 },
  { TaskID: '4b6e22ee-b4ed-45a4-a6af-5294b0d69f37', Duration: 1, Impact: 3 },
  { TaskID: 'd6372f32-852b-46a9-8e8c-e730fecc3c22', Duration: 5, Impact: 5 },
  { TaskID: 'ec40b581-bdfc-43e0-a047-871fdafe8167', Duration: 7, Impact: 3 },
  { TaskID: 'fb1e3165-67c9-4e96-a5c3-2d20085d293b', Duration: 6, Impact: 3 }
];

class Scheduler {
  constructor(tasks, capacity) {
    this.tasks = Array.isArray(tasks) ? tasks : [];
    this.capacity = Number.isFinite(Number(capacity)) ? Number(capacity) : 0;
  }

  schedule() {
    const n = this.tasks.length;
    const W = Math.max(0, Math.floor(this.capacity));
    const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const task = this.tasks[i - 1];
      const wt = Math.max(0, Math.floor(task.Duration || 0));
      const val = Number(task.Impact || 0);

      for (let w = 0; w <= W; w++) {
        if (wt <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    const selected = [];
    let w = W;
    for (let i = n; i > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        const task = this.tasks[i - 1];
        selected.push(task);
        w -= Math.max(0, Math.floor(task.Duration || 0));
      }
    }

    const selectedTasks = selected.reverse();
    const totalImpact = dp[n][W] || 0;
    const totalDuration = selectedTasks.reduce((sum, task) => sum + (Number(task.Duration) || 0), 0);

    return { selectedTasks, totalImpact, totalDuration };
  }
}

app.get('/schedule/:depotId', (req, res) => {
  const depotId = Number(req.params.depotId);
  if (!Number.isFinite(depotId)) {
    return res.status(400).json({ error: 'Invalid depotId' });
  }

  const depot = DEPOTS.find(d => Number(d.ID) === depotId);
  if (!depot) {
    return res.status(404).json({ error: `Depot ${depotId} not found` });
  }

  const scheduler = new Scheduler(VEHICLES, depot.MechanicHours);
  const result = scheduler.schedule();

  return res.json({
    depotId: depot.ID,
    mechanicHoursBudget: depot.MechanicHours,
    totalImpact: result.totalImpact,
    totalDuration: result.totalDuration,
    selectedTasks: result.selectedTasks
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Vehicle Scheduling Service running on port ${PORT}`);
});
