#!/bin/sh
set -e

# Wait for the database to be ready
echo "Waiting for database at $DB_HOST:$DB_PORT..."

# Simple wait loop using Node.js since netcat might not be available
node -e '
const net = require("net");
const host = process.env.DB_HOST || "database";
const port = process.env.DB_PORT || 5432;
const client = new net.Socket();

function tryConnect() {
  client.connect(port, host, () => {
    client.end();
    process.exit(0);
  });
}

client.on("error", (err) => {
  console.log("Waiting for DB...");
  setTimeout(tryConnect, 2000);
});

tryConnect();
'

echo "✅ Database is ready!"

# Run migrations
echo "🚀 Running database migrations..."
node migrations/run-migrations.js

# Run seeds
echo "🌱 Seeding database..."
node seeders/run-seeders.js || echo "⚠️  Seeding failed (might be duplicates). Continuing..."

# Start application
echo "🎉 Starting application..."
exec node src/server.js
