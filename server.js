const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Paths
const DB_PATH = path.join(__dirname, 'db.json');

// Piece Definitions
const PIECES_TEMPLATES = [
  // 1x1
  { cells: [[0, 0]], width: 1, height: 1 },
  // 1x2
  { cells: [[0, 0], [0, 1]], width: 2, height: 1 },
  { cells: [[0, 0], [1, 0]], width: 1, height: 2 },
  // 1x3
  { cells: [[0, 0], [0, 1], [0, 2]], width: 3, height: 1 },
  { cells: [[0, 0], [1, 0], [2, 0]], width: 1, height: 3 },
  // 1x4
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], width: 4, height: 1 },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], width: 1, height: 4 },
  // 1x5
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], width: 5, height: 1 },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], width: 1, height: 5 },
  // 2x2 Square
  { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
  // 3x3 Square
  { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
  // L-Shapes 2x2
  { cells: [[0, 0], [1, 0], [1, 1]], width: 2, height: 2 },
  { cells: [[0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
  { cells: [[0, 0], [0, 1], [1, 0]], width: 2, height: 2 },
  { cells: [[0, 0], [0, 1], [1, 1]], width: 2, height: 2 },
  // L-Shapes 3x3
  { cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
  { cells: [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
  { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], width: 3, height: 3 },
  { cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], width: 3, height: 3 },
  // T-Shapes
  { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], width: 3, height: 2 },
  { cells: [[0, 1], [1, 0], [1, 1], [2, 1]], width: 2, height: 3 },
  { cells: [[0, 1], [1, 0], [1, 1], [1, 2]], width: 3, height: 2 },
  { cells: [[0, 0], [1, 0], [1, 1], [2, 0]], width: 2, height: 3 },
  // Z-Shapes
  { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], width: 3, height: 2 },
  { cells: [[0, 1], [1, 0], [1, 1], [2, 0]], width: 2, height: 3 },
  // S-Shapes
  { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], width: 3, height: 2 },
  { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], width: 2, height: 3 }
];

// Database operations
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: {},          // phone -> user details
      transactions: [],   // list of transactions
      games: {},          // gameId -> game details
      history: []         // array of completed games list
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading database file, resetting:", e);
    const initialData = { users: {}, transactions: [], games: {}, history: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing to database file:", e);
  }
}

// Generate random referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate random ID
function generateId() {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

// Check if piece fits at board[row][col]
function canPlacePiece(board, cells, row, col) {
  for (const [cellRow, cellCol] of cells) {
    const targetRow = row + cellRow;
    const targetCol = col + cellCol;
    if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) {
      return false;
    }
    if (board[targetRow][targetCol] !== 0) {
      return false;
    }
  }
  return true;
}

// Check if a piece can fit anywhere on the board
function pieceCanFitAnywhere(board, cells, width, height) {
  for (let r = 0; r <= 8 - height; r++) {
    for (let c = 0; c <= 8 - width; c++) {
      if (canPlacePiece(board, cells, r, c)) {
        return true;
      }
    }
  }
  return false;
}

// Generate 3 random tray pieces
function generateTray() {
  const tray = [];
  for (let i = 0; i < 3; i++) {
    const template = PIECES_TEMPLATES[Math.floor(Math.random() * PIECES_TEMPLATES.length)];
    tray.push({
      cells: template.cells,
      width: template.width,
      height: template.height,
      colorId: Math.floor(Math.random() * 7) + 1, // 1 to 7
      available: true
    });
  }
  return tray;
}

// Check for filled lines and cols
function getClearedLines(board) {
  const rows = [];
  const cols = [];

  // Check rows
  for (let r = 0; r < 8; r++) {
    if (board[r].every(cell => cell !== 0)) {
      rows.push(r);
    }
  }

  // Check cols
  for (let c = 0; c < 8; c++) {
    let filled = true;
    for (let r = 0; r < 8; r++) {
      if (board[r][c] === 0) {
        filled = false;
        break;
      }
    }
    if (filled) {
      cols.push(c);
    }
  }

  return { rows, cols };
}

// Session Helpers
function getSessionUser(req) {
  const phone = req.cookies.user_phone;
  if (!phone) return null;
  const db = readDB();
  return db.users[phone] || null;
}

// Periodically approve pending deposits in background
setInterval(() => {
  const db = readDB();
  let updated = false;

  db.transactions.forEach(tx => {
    if (tx.type === 'DEPOSIT' && tx.status === 'PENDING') {
      // Automatic approval after 5 seconds
      const elapsed = Date.now() - new Date(tx.createdAt).getTime();
      if (elapsed >= 5000) {
        tx.status = 'COMPLETED';
        const user = db.users[tx.phone];
        if (user) {
          user.balanceCents += tx.amountCents;
          updated = true;
          console.log(`[DEPOSIT] Auto-approved R$ ${(tx.amountCents / 100).toFixed(2)} for ${tx.phone}`);
        }
      }
    }
  });

  if (updated) {
    writeDB(db);
  }
}, 1000);

// --- APIs ---

// 1. Auth APIs
app.post('/api/auth/register', (req, res) => {
  const { name, phone, password, referralCode } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
    return res.status(400).json({ message: "Telefone inválido — informe DDD + número" });
  }

  const db = readDB();
  if (db.users[cleanPhone]) {
    return res.status(400).json({ message: "Este telefone já está cadastrado." });
  }

  // Create user
  const newUser = {
    name: name.trim(),
    phone: cleanPhone,
    password: password, // plaintext for this clone/demo
    referralCode: generateReferralCode(),
    balanceCents: 0,
    comissao_saldo_cents: 0,
    totalCommissionCents: 0,
    indicados_count: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    totalWonCents: 0,
    biggestWinCents: 0,
    referredBy: null
  };

  // Process referral
  if (referralCode) {
    const referrer = Object.values(db.users).find(u => u.referralCode === referralCode.trim().toUpperCase());
    if (referrer) {
      newUser.referredBy = referrer.phone;
      referrer.indicados_count += 1;
      console.log(`[AFFILIATE] User ${cleanPhone} registered using ref ${referrer.phone}`);
    }
  }

  db.users[cleanPhone] = newUser;
  writeDB(db);

  res.cookie('user_phone', cleanPhone, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
  res.json({
    user: { name: newUser.name, phone: newUser.phone },
    balanceCents: newUser.balanceCents
  });
});

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: "Preencha o telefone e senha." });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const db = readDB();
  const user = db.users[cleanPhone];

  if (!user || user.password !== password) {
    return res.status(400).json({ message: "Telefone ou senha incorretos." });
  }

  res.cookie('user_phone', cleanPhone, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
  res.json({
    user: { name: user.name, phone: user.phone },
    balanceCents: user.balanceCents
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Não autorizado." });
  }
  res.json({
    user: { name: user.name, phone: user.phone },
    balanceCents: user.balanceCents
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('user_phone');
  res.json({ success: true });
});

app.post('/api/users/password', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  const { currentPassword, newPassword } = req.body;
  if (user.password !== currentPassword) {
    return res.status(400).json({ message: "Senha atual incorreta." });
  }

  const db = readDB();
  db.users[user.phone].password = newPassword;
  writeDB(db);

  res.json({ success: true });
});

// 2. Public configs & stats
app.get('/api/public/config', (req, res) => {
  res.json({
    entrada_valores: [3, 5, 10, 20, 50, 100],
    deposito_valores_rapidos: [20, 30, 50, 100, 200],
    deposito_botoes_labels: {
      "20": "MÍNIMO",
      "30": "QUENTE",
      "50": "+CHANCES",
      "100": "BÔNUS",
      "200": "BÔNUS"
    },
    deposito_botoes_cores: {
      "20": "#f59e0b",
      "30": "#ef4444",
      "50": "#22c55e",
      "100": "#8b5cf6",
      "200": "#8b5cf6"
    },
    fin: {
      deposito_minimo: 20,
      deposito_maximo: 10000,
      saque_minimo: 30,
      saque_afiliado_minimo: 30
    }
  });
});

app.get('/api/wallet/deposit-info', (req, res) => {
  res.json({
    elegivel: true,
    bonus_minimo: 20,
    bonus_maximo: 500,
    bonus_percentual: 50
  });
});

// Wallet operations
app.get('/api/wallet/', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Não autorizado." });
  }
  const db = readDB();
  const userTxs = db.transactions.filter(tx => tx.phone === user.phone);
  res.json({
    balanceCents: user.balanceCents,
    transactions: userTxs
  });
});

app.post('/api/wallet/deposit', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  const { amountCents } = req.body;
  if (!amountCents || amountCents < 2000) {
    return res.status(400).json({ message: "Depósito mínimo de R$ 20,00" });
  }

  const txid = 'TX' + generateId();
  // Standard simulated PIX QR Code & copy-paste code
  const pixCode = `00020101021126580014br.gov.bcb.pix0136blockwin-simulated-keys-pix-keys0218BlockWin Game Play5204000053039865405${(amountCents / 100).toFixed(2)}5802BR5915BLOCKWIN JOGOS6009SAO PAULO62170513${txid}6304FC3C`;
  const qrcode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

  const db = readDB();
  const newTx = {
    id: txid,
    phone: user.phone,
    type: 'DEPOSIT',
    status: 'PENDING',
    amountCents: amountCents,
    pixCode: pixCode,
    qrcode: qrcode,
    txid: txid,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(newTx);
  writeDB(db);

  console.log(`[DEPOSIT] Created pending deposit of R$ ${(amountCents / 100).toFixed(2)} for ${user.phone}. Will auto-approve in 5 seconds.`);

  res.json({
    balanceCents: db.users[user.phone].balanceCents,
    pixCode: pixCode,
    qrcode: qrcode,
    txid: txid
  });
});

app.post('/api/wallet/withdraw', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  const { amountCents, pixKey, typePix } = req.body;
  if (!amountCents || amountCents < 3000) {
    return res.status(400).json({ message: "Saque mínimo de R$ 30,00" });
  }

  const db = readDB();
  const dbUser = db.users[user.phone];

  if (dbUser.balanceCents < amountCents) {
    return res.status(400).json({ message: "Saldo insuficiente." });
  }

  // Deduct balance and register Completed withdraw
  dbUser.balanceCents -= amountCents;
  const txid = 'TX' + generateId();
  const newTx = {
    id: txid,
    phone: user.phone,
    type: 'WITHDRAW',
    status: 'COMPLETED',
    amountCents: amountCents,
    pixKey: pixKey,
    typePix: typePix,
    txid: txid,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(newTx);
  writeDB(db);

  console.log(`[WITHDRAW] User ${user.phone} withdrew R$ ${(amountCents / 100).toFixed(2)}`);

  res.json({
    balanceCents: dbUser.balanceCents
  });
});

app.post('/api/wallet/withdraw-affiliate', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  const { amountCents, pixKey, typePix } = req.body;
  if (!amountCents || amountCents < 3000) {
    return res.status(400).json({ message: "Saque de comissões mínimo de R$ 30,00" });
  }

  const db = readDB();
  const dbUser = db.users[user.phone];

  if (dbUser.comissao_saldo_cents < amountCents) {
    return res.status(400).json({ message: "Saldo de comissões insuficiente." });
  }

  dbUser.comissao_saldo_cents -= amountCents;
  const txid = 'TX' + generateId();
  const newTx = {
    id: txid,
    phone: user.phone,
    type: 'WITHDRAW_AFFILIATE',
    status: 'COMPLETED',
    amountCents: amountCents,
    pixKey: pixKey,
    typePix: typePix,
    txid: txid,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(newTx);
  writeDB(db);

  console.log(`[AFFILIATE WITHDRAW] User ${user.phone} withdrew commission R$ ${(amountCents / 100).toFixed(2)}`);

  res.json({
    balanceCents: dbUser.balanceCents // returns main balance to refresh panel shell
  });
});

app.post('/api/cupons/resgatar', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  const { codigo } = req.body;
  if (!codigo) {
    return res.status(400).json({ message: "Código inválido." });
  }

  const codeUpper = codigo.trim().toUpperCase();
  if (codeUpper !== 'BLOCK10' && codeUpper !== 'GANHE20') {
    return res.status(400).json({ message: "Cupom inválido ou expirado." });
  }

  const db = readDB();
  const dbUser = db.users[user.phone];

  // Simple validation to prevent multiple coupon claims in demo
  const userTxs = db.transactions.filter(tx => tx.phone === user.phone && tx.type === 'DEPOSIT' && tx.pixKey === `CUPOM:${codeUpper}`);
  if (userTxs.length > 0) {
    return res.status(400).json({ message: "Você já resgatou este cupom!" });
  }

  const rewardCents = codeUpper === 'BLOCK10' ? 1000 : 2000;
  dbUser.balanceCents += rewardCents;

  const txid = 'TX' + generateId();
  const newTx = {
    id: txid,
    phone: user.phone,
    type: 'DEPOSIT',
    status: 'COMPLETED',
    amountCents: rewardCents,
    pixKey: `CUPOM:${codeUpper}`,
    txid: txid,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(newTx);
  writeDB(db);

  console.log(`[COUPON] User ${user.phone} redeemed coupon ${codeUpper} for R$ ${(rewardCents / 100).toFixed(2)}`);

  res.json({
    balanceCents: dbUser.balanceCents,
    transaction: { status: 'COMPLETED' }
  });
});

// Affiliate referrals endpoints
app.get('/api/users/referrals', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  res.json({
    refCode: user.referralCode,
    link: `${req.protocol}://${req.get('host')}/cadastro?ref=${user.referralCode}`,
    commissionRate: 0.10, // 10%
    totalCommissionCents: user.totalCommissionCents,
    comissao_saldo_cents: user.comissao_saldo_cents,
    indicados_count: user.indicados_count
  });
});

app.get('/api/indicacao/info', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  const db = readDB();
  const referralsList = Object.values(db.users).filter(u => u.referredBy === user.phone);
  const n1Count = referralsList.length;

  // calculate total deposit amount of referrals to mock commission details
  let n1DepositedCents = 0;
  referralsList.forEach(ref => {
    const refDeposits = db.transactions.filter(t => t.phone === ref.phone && t.type === 'DEPOSIT' && t.status === 'COMPLETED');
    refDeposits.forEach(d => {
      n1DepositedCents += d.amountCents;
    });
  });

  res.json({
    codigo: user.referralCode,
    link: `${req.protocol}://${req.get('host')}/cadastro?ref=${user.referralCode}`,
    comissao_nivel1_perc: 10,
    total_comissao_cents: user.totalCommissionCents,
    saldo_cents: user.comissao_saldo_cents,
    indicados_count: user.indicados_count,
    n1Count: n1Count,
    n1DepositedCents: n1DepositedCents,
    n2Count: 0,
    n2DepositedCents: 0,
    history: referralsList.map(r => ({
      name: r.name,
      createdAt: new Date().toISOString(), // Mock referral signup date
      status: 'Ativo'
    }))
  });
});

// 3. Game APIs

app.get('/api/game/config', (req, res) => {
  res.json({
    targetMultiplier: 2.0,
    ratePerLine: 0.10, // 10% of bet per line
    minBetCents: 300,
    maxBetCents: 10000,
    entrada_valores: [3, 5, 10, 20, 50, 100]
  });
});

app.get('/api/game/active', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  const db = readDB();
  const activeGame = Object.values(db.games).find(g => g.phone === user.phone && g.status === 'ACTIVE');

  res.json({
    session: activeGame || null
  });
});

app.post('/api/game/start', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  const { betCents } = req.body;
  if (!betCents || betCents < 100) {
    return res.status(400).json({ message: "Aposta mínima de R$ 1,00" });
  }

  const db = readDB();
  const dbUser = db.users[user.phone];

  if (dbUser.balanceCents < betCents) {
    return res.status(400).json({ message: "Saldo insuficiente. Faça um depósito no painel." });
  }

  // Check if there is already an active game and forfeit it
  const oldActiveGame = Object.values(db.games).find(g => g.phone === user.phone && g.status === 'ACTIVE');
  if (oldActiveGame) {
    oldActiveGame.status = 'LOST';
  }

  // Deduct balance
  dbUser.balanceCents -= betCents;

  const gameId = 'G' + generateId();
  const config = {
    targetMultiplier: 2.0,
    ratePerLine: 0.10
  };

  const newGame = {
    id: gameId,
    phone: user.phone,
    status: 'ACTIVE',
    betCents: betCents,
    accumulatedCents: 0,
    targetCents: Math.round(betCents * config.targetMultiplier),
    targetMultiplier: config.targetMultiplier,
    board: Array(8).fill(0).map(() => Array(8).fill(0)),
    tray: generateTray(),
    createdAt: new Date().toISOString()
  };

  db.games[gameId] = newGame;
  writeDB(db);

  console.log(`[GAME] Started game ${gameId} with bet R$ ${(betCents / 100).toFixed(2)} for ${user.phone}`);

  res.json({
    session: newGame
  });
});

app.post('/api/game/:gameId/move', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  const { gameId } = req.params;
  const { pieceIndex, row, col } = req.body;

  const db = readDB();
  const game = db.games[gameId];

  if (!game || game.phone !== user.phone || game.status !== 'ACTIVE') {
    return res.status(400).json({ message: "Partida inválida ou já finalizada." });
  }

  if (pieceIndex < 0 || pieceIndex >= 3) {
    return res.status(400).json({ message: "Peça inválida." });
  }

  const piece = game.tray[pieceIndex];
  if (!piece || !piece.available) {
    return res.status(400).json({ message: "Peça indisponível." });
  }

  // Validate placement
  if (!canPlacePiece(game.board, piece.cells, row, col)) {
    return res.status(400).json({ message: "Jogada inválida nesta posição." });
  }

  // Place the piece
  game.board = ne(game.board, piece.cells, row, col, piece.colorId);
  piece.available = false;

  // Check cleared rows/cols
  const cleared = getClearedLines(game.board);
  const clearedCount = cleared.rows.length + cleared.cols.length;
  let gainedCents = 0;

  if (clearedCount > 0) {
    // Math: each cleared line is 10% of bet
    const configRate = 0.10;
    gainedCents = Math.round(game.betCents * configRate * clearedCount);
    game.accumulatedCents += gainedCents;

    // Clear board cells for rows
    for (const r of cleared.rows) {
      for (let c = 0; c < 8; c++) {
        game.board[r][c] = 0;
      }
    }
    // Clear board cells for cols
    for (const c of cleared.cols) {
      for (let r = 0; r < 8; r++) {
        game.board[r][c] = 0;
      }
    }
  }

  // If all pieces in tray are placed (available === false), generate new set of 3 pieces!
  const allUsed = game.tray.every(p => !p.available);
  if (allUsed) {
    game.tray = generateTray();
  }

  // Check Game Over: can ANY available piece in tray be placed on the current board?
  let gameOver = true;
  for (const p of game.tray) {
    if (p.available && pieceCanFitAnywhere(game.board, p.cells, p.width, p.height)) {
      gameOver = false;
      break;
    }
  }

  if (gameOver) {
    game.status = 'LOST';
    // update stats
    const dbUser = db.users[user.phone];
    dbUser.gamesPlayed += 1;
    // Add to history
    db.history.push({
      id: game.id,
      phone: user.phone,
      betCents: game.betCents,
      accumulatedCents: game.accumulatedCents,
      status: 'LOST',
      createdAt: new Date().toISOString()
    });
    console.log(`[GAME OVER] Game ${gameId} locked. User ${user.phone} lost R$ ${(game.betCents / 100).toFixed(2)}`);
  }

  writeDB(db);

  res.json({
    clearedRows: cleared.rows,
    clearedCols: cleared.cols,
    gainedCents: gainedCents,
    gameOver: gameOver,
    session: game
  });
});

// Place helper inside server code for sychronous modification of nested arrays
function ne(board, cells, row, col, colorId) {
  const newBoard = board.map(r => [...r]);
  for (const [cellRow, cellCol] of cells) {
    newBoard[row + cellRow][col + cellCol] = colorId;
  }
  return newBoard;
}

app.post('/api/game/:gameId/cashout', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  const { gameId } = req.params;

  const db = readDB();
  const game = db.games[gameId];

  if (!game || game.phone !== user.phone || game.status !== 'ACTIVE') {
    return res.status(400).json({ message: "Partida inválida ou já encerrada." });
  }

  if (game.accumulatedCents < game.targetCents) {
    return res.status(400).json({ message: "Você ainda não atingiu a meta de resgate." });
  }

  // Update Game status
  game.status = 'CASHED_OUT';

  // Add winnings to balance
  const dbUser = db.users[user.phone];
  dbUser.balanceCents += game.accumulatedCents;
  dbUser.gamesPlayed += 1;
  dbUser.gamesWon += 1;
  dbUser.totalWonCents += game.accumulatedCents;

  if (game.accumulatedCents > dbUser.biggestWinCents) {
    dbUser.biggestWinCents = game.accumulatedCents;
  }

  // Process affiliate commission if user has referrer
  if (dbUser.referredBy) {
    const referrer = db.users[dbUser.referredBy];
    if (referrer) {
      // 10% commission of the bet amount as commission reward
      const commissionCents = Math.round(game.betCents * 0.10);
      referrer.comissao_saldo_cents += commissionCents;
      referrer.totalCommissionCents += commissionCents;
      console.log(`[AFFILIATE COMMISSION] Credited R$ ${(commissionCents / 100).toFixed(2)} to ${referrer.phone} from referral ${user.phone}`);
    }
  }

  // Add to history
  db.history.push({
    id: game.id,
    phone: user.phone,
    betCents: game.betCents,
    accumulatedCents: game.accumulatedCents,
    status: 'CASHED_OUT',
    createdAt: new Date().toISOString()
  });

  writeDB(db);

  console.log(`[CASHOUT] Game ${gameId} cashed out. User ${user.phone} won R$ ${(game.accumulatedCents / 100).toFixed(2)}`);

  res.json({
    session: game
  });
});

app.post('/api/game/forfeit', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  const db = readDB();
  const activeGame = Object.values(db.games).find(g => g.phone === user.phone && g.status === 'ACTIVE');

  if (activeGame) {
    activeGame.status = 'LOST';
    const dbUser = db.users[user.phone];
    dbUser.gamesPlayed += 1;

    db.history.push({
      id: activeGame.id,
      phone: user.phone,
      betCents: activeGame.betCents,
      accumulatedCents: activeGame.accumulatedCents,
      status: 'LOST',
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    console.log(`[FORFEIT] Active game ${activeGame.id} forfeited by user ${user.phone}`);
  }

  res.json({ success: true });
});

app.get('/api/game/history', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  const db = readDB();
  const userGames = db.history.filter(g => g.phone === user.phone);

  res.json({
    games: userGames.map(g => ({
      id: g.id,
      betCents: g.betCents,
      payoutCents: g.status === 'CASHED_OUT' ? g.accumulatedCents : 0,
      status: g.status,
      createdAt: g.createdAt
    }))
  });
});

app.get('/api/users/stats', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  res.json({
    gamesPlayed: user.gamesPlayed,
    gamesWon: user.gamesWon,
    totalWonCents: user.totalWonCents,
    biggestWinCents: user.biggestWinCents
  });
});

// Serve frontend assets safely
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.get('/favicon.png', (req, res) => res.sendFile(path.join(__dirname, 'favicon.png')));
app.get('/apple-touch-icon.png', (req, res) => res.sendFile(path.join(__dirname, 'apple-touch-icon.png')));
app.get('/apple-touch-icon-180x180.png', (req, res) => res.sendFile(path.join(__dirname, 'apple-touch-icon-180x180.png')));
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'manifest.json')));
app.get('/mock-api.js', (req, res) => res.sendFile(path.join(__dirname, 'mock-api.js')));
app.get('/_redirects', (req, res) => res.sendFile(path.join(__dirname, '_redirects')));

// Handle React router paths by serving index.html
app.get(['/', '/login', '/cadastro', '/painel', '/jogo'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open in browser to play!`);
});
