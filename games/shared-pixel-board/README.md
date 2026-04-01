# Shared Pixel Board

Realtime collaborative 100x100 pixel board for GitHub Pages using Firebase Realtime Database.

## Features

- Realtime sync using Firebase listeners
- Last-write-wins pixel updates
- Client cooldown options (1s / 3s / 5s)
- Color validation (`#RRGGBB`)
- No-op write blocking (skip unchanged color writes)
- Optional grid overlay
- Approximate live user count via presence

## Setup

1. Create a Firebase project.
2. Enable Realtime Database.
3. Confirm the config is present in [app.js](app.js).
4. Deploy Firebase rules from [firebase-rules.json](firebase-rules.json).
5. Deploy to GitHub Pages.

## Deploy Rules

```bash
firebase login
firebase use project-6657144175400685165
cp ./games/shared-pixel-board/firebase-rules.json ./database.rules.json
echo '{"database":{"rules":"database.rules.json"}}' > firebase.json
firebase deploy --only database
```

If you prefer not to use the CLI, open Firebase Console and paste the JSON from [firebase-rules.json](firebase-rules.json) into Realtime Database Rules.

## Hardened Rules Included

Rules in [firebase-rules.json](firebase-rules.json) enforce:

- strict pixel key format (`x_y`)
- strict color value format (`#RRGGBB`)
- limited metadata shape
- presence key and timestamp validation
- deny-all fallback for unknown paths
