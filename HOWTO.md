# How to run and verify the services

This repo contains two backend services used for the assessment.

Services
- `vehicle_scheduling_be` (port 3001)
- `campus_notifications` (port 3002)

Quick start (Windows PowerShell)

1. Install dependencies for each service (run once):

```powershell
cd c:\Users\bniha\vtu25330\vehicle_scheduling_be
npm install
cd ..\campus_notifications
npm install
```

2. Start both services (each in its own terminal):

```powershell
# Terminal 1
cd c:\Users\bniha\vtu25330\vehicle_scheduling_be
node index.js

# Terminal 2
cd c:\Users\bniha\vtu25330\campus_notifications
node index.js
```

3. Verify endpoints (PowerShell examples):

```powershell
# Vehicle scheduler
Invoke-RestMethod -Uri 'http://127.0.0.1:3001/schedule/1' | ConvertTo-Json -Depth 5

# Notifications (limit 5)
Invoke-RestMethod -Uri 'http://127.0.0.1:3002/notifications?limit=5' | ConvertTo-Json -Depth 5
```

Postman

- Import `postman_collection.json` as a Collection.
- Import `postman_environment.json` as an Environment and select it.
- Run `Auth - Get Token` to populate `ACCESS_TOKEN` (response-dependent).
- Use the local requests in the collection to call the services.

Files added for testing
- `postman_collection.json` — Postman requests for auth and local endpoints
- `postman_environment.json` — environment variables (email, client id, etc.)
- `HOWTO.md` — this file

Repository and GitHub
- All files are committed and pushed to `main`.
- Check the repo root for `HOWTO.md`, `postman_collection.json`, and `postman_environment.json`.

If you want, I can also:
- Add a single PowerShell script to start both services in background,
- Or create a concise README section and link the important files.
