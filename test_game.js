const http = require('http');
const fs = require('fs');
const path = require('path');

// Port for testing
const PORT = 3000;

// Clean database before starting
const DB_PATH = path.join(__dirname, 'db.json');
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

// Start the server
const serverProcess = require('./server.js');

// Simple fetch implementation for testing using http module
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        const cookieHeader = res.headers['set-cookie'];
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cookies: cookieHeader ? cookieHeader.map(c => c.split(';')[0]) : [],
          body: responseBody ? JSON.parse(responseBody) : null
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

// Wait function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log("Waiting for server to start...");
  await delay(1000); // Wait for Express to bind to port

  let cookie = '';

  try {
    // 1. Register User
    console.log("\n[TEST] 1. Registering user...");
    const regRes = await request('POST', '/api/auth/register', {
      name: "Jogador Teste",
      phone: "11999999999",
      password: "password123"
    });
    
    if (regRes.statusCode !== 200 || !regRes.body.user) {
      throw new Error(`Failed to register user: ${JSON.stringify(regRes.body)}`);
    }
    console.log("User registered successfully. Balance:", regRes.body.balanceCents);
    cookie = regRes.cookies[0]; // Get the session cookie

    // 2. Profile check
    console.log("\n[TEST] 2. Checking profile (/api/auth/me)...");
    const meRes = await request('GET', '/api/auth/me', null, { 'Cookie': cookie });
    if (meRes.statusCode !== 200 || meRes.body.user.name !== "Jogador Teste") {
      throw new Error(`Profile mismatch: ${JSON.stringify(meRes.body)}`);
    }
    console.log("Profile details verified.");

    // 3. Deposit money
    console.log("\n[TEST] 3. Depositing R$ 20.00...");
    const depRes = await request('POST', '/api/wallet/deposit', {
      amountCents: 2000
    }, { 'Cookie': cookie });
    
    if (depRes.statusCode !== 200 || !depRes.body.pixCode) {
      throw new Error(`Deposit failed: ${JSON.stringify(depRes.body)}`);
    }
    console.log("Deposit pending transaction created. PIX Code:", depRes.body.pixCode.substring(0, 40) + "...");

    // Wait 6 seconds for background auto-approval to kick in
    console.log("Waiting 6 seconds for deposit simulation auto-approval...");
    await delay(6000);

    // Check updated wallet balance
    const walletRes = await request('GET', '/api/wallet/', null, { 'Cookie': cookie });
    if (walletRes.statusCode !== 200 || walletRes.body.balanceCents !== 2000) {
      throw new Error(`Balance not updated! Current: ${walletRes.body.balanceCents}`);
    }
    console.log("Deposit completed successfully! Balance is now R$ 20.00.");

    // 4. Start game
    console.log("\n[TEST] 4. Starting game with a bet of R$ 5.00...");
    const gameStart = await request('POST', '/api/game/start', {
      betCents: 500
    }, { 'Cookie': cookie });

    if (gameStart.statusCode !== 200 || !gameStart.body.session) {
      throw new Error(`Failed to start game: ${JSON.stringify(gameStart.body)}`);
    }
    const session = gameStart.body.session;
    console.log(`Game started. Game ID: ${session.id}, Target Cents: ${session.targetCents}, Tray Pieces: ${session.tray.length}`);

    // Verify balance was deducted
    const walletAfterBet = await request('GET', '/api/wallet/', null, { 'Cookie': cookie });
    if (walletAfterBet.body.balanceCents !== 1500) {
      throw new Error(`Balance after bet incorrect: ${walletAfterBet.body.balanceCents}`);
    }
    console.log("Balance deducted correctly to R$ 15.00.");

    // 5. Make a valid placement move
    console.log("\n[TEST] 5. Making a move...");
    const activePiece = session.tray[0];
    console.log(`Placing piece at index 0 (width: ${activePiece.width}, height: ${activePiece.height}) at row 0, col 0...`);
    const moveRes = await request('POST', `/api/game/${session.id}/move`, {
      pieceIndex: 0,
      row: 0,
      col: 0
    }, { 'Cookie': cookie });

    if (moveRes.statusCode !== 200) {
      throw new Error(`Move rejected: ${JSON.stringify(moveRes.body)}`);
    }
    console.log(`Move success. Piece set available: ${moveRes.body.session.tray[0].available}. Board[0][0] colorId: ${moveRes.body.session.board[0][0]}`);

    // 6. Test forfeit (since we don't need to play the entire game to test APIs)
    console.log("\n[TEST] 6. Forfeiting game...");
    const forfeitRes = await request('POST', '/api/game/forfeit', null, { 'Cookie': cookie });
    if (forfeitRes.statusCode !== 200) {
      throw new Error(`Forfeit failed: ${JSON.stringify(forfeitRes.body)}`);
    }
    console.log("Forfeit verified.");

    // Check stats
    const statsRes = await request('GET', '/api/users/stats', null, { 'Cookie': cookie });
    if (statsRes.statusCode !== 200 || statsRes.body.gamesPlayed !== 1) {
      throw new Error(`Stats mismatch: ${JSON.stringify(statsRes.body)}`);
    }
    console.log("Stats verified. Games Played:", statsRes.body.gamesPlayed);

    console.log("\n[TESTS PASSED] Integration tests completed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("\n[TEST FAILED] Error:", err.message);
    process.exit(1);
  }
}

runTests();
