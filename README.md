# Source code for [insort.app](https://insort.app)

Insort is a game where you sort a deck of cards by some attribute. It's main components are React, Socket.io, Express and PostgreSQL.

![](screenshot.png)

# Running

- Clone the repository and install dependencies
- Set environment variables. Example:
  - DATABASE_URL=postgres://postgres:postgres@localhost:5432/insort-db
  - ENVIRONMENT=development
- Run in two terminals:
  - `npm run watch-client`: watches for changes in the client and rebuilds the bundle
  - `npm run watch-server`: watches for changes in the server and restarts the server
