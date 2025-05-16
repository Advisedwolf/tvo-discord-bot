# TVO Helper Bot

A modular Discord bot built with Discord.js v14+ featuring six interaction types, fully tested and structured for scalability.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Command & Interaction Overview](#command--interaction-overview)

  - [Slash Commands](#slash-commands)
  - [Button Components](#button-components)
  - [Select Menus](#select-menus)
  - [Modals](#modals)
  - [User Context Menus](#user-context-menus)
  - [Message Context Menus](#message-context-menus)

- [Folder Structure](#folder-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

- ✅ **Slash Commands**: `/ping`, `/button`, `/selectmenu`, `/modal`
- ✅ **Button Interactions**: dynamically created and handled
- ✅ **Select-Menu Interactions**: dropdowns with option handling
- ✅ **Modal Interactions**: pop-up forms and input processing
- ✅ **Context Menus**: both user and message context menus
- 🧪 **Fully Tested**: unit tests for all handlers using Mocha & Chai
- 📦 **Modular Architecture**: commands and handlers separated into folders, with recursive loading

---

## Getting Started

1. Clone the repo:

   ```bash
   git clone <repo_url> tvo_discord_bot
   cd tvo_discord_bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with:

   ```dotenv
   DISCORD_TOKEN=your-bot-token
   CLIENT_ID=your-application-id
   GUILD_ID=your-guild-id
   ```

4. Deploy commands:

   ```bash
   npm run deploy-commands
   ```

5. Start the bot:

   ```bash
   npm start
   ```

---

## Command & Interaction Overview

### Slash Commands

- **`/ping`**: Replies with `Pong!`.
- **`/button`**: Sends an ephemeral message with a **Click Me!** button.
- **`/selectmenu`**: Presents a dropdown with **Option A** & **Option B**, then replies with the selected value.
- **`/modal`**: Opens a modal dialog; upon submit, thanks the user and echoes their input.

### Button Components

- **Custom ID**: `button`
- **Flow**:

  1. `/button` → bot replies with a button.
  2. Click button → bot sends a follow-up button message.

### Select Menus

- **Custom ID**: `selectmenu`
- **Flow**:

  1. `/selectmenu` → bot replies with a dropdown.
  2. Choose an option → bot replies with `You selected: <value>`.

### Modals

- **Custom ID**: `modal`
- **Flow**:

  1. `/modal` → bot shows a modal titled “Tell me something.”
  2. Submit → bot replies with `Thanks for your feedback: "<your input>"`.

### User Context Menus

- **Name**: `userAction`
- **Flow**:

  1. Right-click user → **Apps → userAction**.
  2. Bot replies: `User context menu command received: userAction on user <username>#<discriminator>`.

### Message Context Menus

- **Name**: `messageAction`
- **Flow**:

  1. Right-click message → **Apps → messageAction**.
  2. Bot replies: `Message context menu command received: messageAction on message <message_id>`.

---

## Folder Structure

```
├── src/
│   ├── commands/               # Slash & Context-menu commands
│   │   ├── Interaction/         # selectMenu.js, modal.js, userContextMenu.js, messageContextMenu.js, buttonCreate.js
│   │   └── ping.js
│   ├── handlers/               # Interaction handlers (slashHandler.js, buttonHandler.js, ...)
│   ├── events/                 # event listeners (e.g. interactionCreate.js)
│   ├── utils/                  # logger, database connectors, etc.
│   └── index.js                # Bot entrypoint and router
├── tests/                      # Test environment (stubs & .spec.js)
│   └── handlers/
│       ├── *Handler.spec.js
│       └── *Handler.js (stubs)
├── deploy-commands.js          # Registers commands to Discord
├── commandHandler.js           # Dynamic recursive loader for commands
├── package.json
└── README.md                   # <— this file
```

---

## Testing

- **Run unit tests**:

  ```bash
  npm test
  ```

- Tests cover all interaction handlers in both “test” and “production” modes.

---

## Deployment

1. Ensure environment variables are set.
2. Deploy (guild or global) commands:

   ```bash
   npm run deploy-commands
   ```

3. Start the bot:

   ```bash
   npm start
   ```

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes.
4. Push to your fork and open a pull request.

Be sure to update or add tests for any new handlers or commands. Have fun building! 🎉
