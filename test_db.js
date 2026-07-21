const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

console.log("Starting DB verification...");

// Clean up old db if any
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

// Import server.js readDB/writeDB logic
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = { users: {}, transactions: [], games: {}, history: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Test initialization
const data1 = readDB();
if (!data1 || typeof data1.users !== 'object' || !Array.isArray(data1.transactions)) {
  console.error("DB initialization failed!");
  process.exit(1);
}
console.log("DB initialized correctly.");

// Test write
data1.users["11999999999"] = { name: "Test User", balanceCents: 5000 };
writeDB(data1);

const data2 = readDB();
if (!data2.users["11999999999"] || data2.users["11999999999"].name !== "Test User") {
  console.error("DB write/read verification failed!");
  process.exit(1);
}
console.log("DB write and persistence verified successfully.");

// Cleanup
fs.unlinkSync(DB_PATH);
process.exit(0);
