(function() {
  const originalFetch = window.fetch;

  // Pieces definitions (same as server)
  const PIECES_TEMPLATES = [
    { cells: [[0, 0]], width: 1, height: 1 },
    { cells: [[0, 0], [0, 1]], width: 2, height: 1 },
    { cells: [[0, 0], [1, 0]], width: 1, height: 2 },
    { cells: [[0, 0], [0, 1], [0, 2]], width: 3, height: 1 },
    { cells: [[0, 0], [1, 0], [2, 0]], width: 1, height: 3 },
    { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], width: 4, height: 1 },
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], width: 1, height: 4 },
    { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], width: 5, height: 1 },
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], width: 1, height: 5 },
    { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
    { cells: [[0, 0], [1, 0], [1, 1]], width: 2, height: 2 },
    { cells: [[0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
    { cells: [[0, 0], [0, 1], [1, 0]], width: 2, height: 2 },
    { cells: [[0, 0], [0, 1], [1, 1]], width: 2, height: 2 },
    { cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
    { cells: [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], width: 3, height: 3 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], width: 3, height: 3 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], width: 3, height: 2 },
    { cells: [[0, 1], [1, 0], [1, 1], [2, 1]], width: 2, height: 3 },
    { cells: [[0, 1], [1, 0], [1, 1], [1, 2]], width: 3, height: 2 },
    { cells: [[0, 0], [1, 0], [1, 1], [2, 0]], width: 2, height: 3 },
    { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], width: 3, height: 2 },
    { cells: [[0, 1], [1, 0], [1, 1], [2, 0]], width: 2, height: 3 },
    { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], width: 3, height: 2 },
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], width: 2, height: 3 }
  ];

  // Database helper
  const DB_KEY = 'block_win_local_db';
  
  function getDB() {
    let db = localStorage.getItem(DB_KEY);
    if (!db) {
      db = {
        users: {},
        transactions: [],
        games: {},
        history: []
      };
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return db;
    }
    return JSON.parse(db);
  }

  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function getLoggedUser(db) {
    const phone = localStorage.getItem('user_session_phone');
    if (!phone) return null;
    return db.users[phone] || null;
  }

  // Piece and Board helpers
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

  function generateTray() {
    const tray = [];
    for (let i = 0; i < 3; i++) {
      const template = PIECES_TEMPLATES[Math.floor(Math.random() * PIECES_TEMPLATES.length)];
      tray.push({
        cells: template.cells,
        width: template.width,
        height: template.height,
        colorId: Math.floor(Math.random() * 7) + 1,
        available: true
      });
    }
    return tray;
  }

  function getClearedLines(board) {
    const rows = [];
    const cols = [];
    for (let r = 0; r < 8; r++) {
      if (board[r].every(cell => cell !== 0)) {
        rows.push(r);
      }
    }
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

  function applyPiece(board, cells, row, col, colorId) {
    const newBoard = board.map(r => [...r]);
    for (const [cellRow, cellCol] of cells) {
      newBoard[row + cellRow][col + cellCol] = colorId;
    }
    return newBoard;
  }

  // Auto approve deposits in background
  setInterval(() => {
    const db = getDB();
    let updated = false;
    const now = Date.now();

    db.transactions.forEach(tx => {
      if (tx.type === 'DEPOSIT' && tx.status === 'PENDING') {
        const elapsed = now - new Date(tx.createdAt).getTime();
        if (elapsed >= 5000) {
          tx.status = 'COMPLETED';
          const user = db.users[tx.phone];
          if (user) {
            user.balanceCents += tx.amountCents;
            updated = true;
            console.log(`[Mock API] Auto-approved Deposit of R$ ${(tx.amountCents / 100).toFixed(2)} for user ${tx.phone}`);
          }
        }
      }
    });

    if (updated) {
      saveDB(db);
    }
  }, 1000);

  // Network Fetch Interceptor
  window.fetch = async function(url, options = {}) {
    let urlString = typeof url === 'string' ? url : url.url;
    
    // Normalize URL
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      const parsed = new URL(urlString);
      urlString = parsed.pathname;
    }

    if (!urlString.startsWith('/api/')) {
      return originalFetch.apply(this, arguments);
    }

    const method = (options.method || 'GET').toUpperCase();
    let body = {};
    if (options.body) {
      try {
        body = JSON.parse(options.body);
      } catch (e) {}
    }

    console.log(`[Mock API Intercept] ${method} ${urlString}`, body);

    const db = getDB();
    const user = getLoggedUser(db);

    // Route: Register
    if (urlString === '/api/auth/register' && method === 'POST') {
      const { name, phone, password, referralCode } = body;
      if (!name || !phone || !password) {
        return new Response(JSON.stringify({ message: "Preencha todos os campos." }), { status: 400 });
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (db.users[cleanPhone]) {
        return new Response(JSON.stringify({ message: "Telefone já cadastrado." }), { status: 400 });
      }

      const referralCodeGenerated = Math.random().toString(36).substring(2, 10).toUpperCase();
      const newUser = {
        name: name.trim(),
        phone: cleanPhone,
        password: password,
        referralCode: referralCodeGenerated,
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

      if (referralCode) {
        const referrer = Object.values(db.users).find(u => u.referralCode === referralCode.trim().toUpperCase());
        if (referrer) {
          newUser.referredBy = referrer.phone;
          referrer.indicados_count += 1;
        }
      }

      db.users[cleanPhone] = newUser;
      saveDB(db);
      localStorage.setItem('user_session_phone', cleanPhone);

      return new Response(JSON.stringify({
        user: { name: newUser.name, phone: newUser.phone },
        balanceCents: newUser.balanceCents
      }), { status: 200 });
    }

    // Route: Login
    if (urlString === '/api/auth/login' && method === 'POST') {
      const { phone, password } = body;
      const cleanPhone = phone.replace(/\D/g, '');
      const dbUser = db.users[cleanPhone];
      if (!dbUser || dbUser.password !== password) {
        return new Response(JSON.stringify({ message: "Telefone ou senha incorretos." }), { status: 400 });
      }

      localStorage.setItem('user_session_phone', cleanPhone);
      return new Response(JSON.stringify({
        user: { name: dbUser.name, phone: dbUser.phone },
        balanceCents: dbUser.balanceCents
      }), { status: 200 });
    }

    // Route: Me
    if (urlString === '/api/auth/me' && method === 'GET') {
      if (!user) {
        return new Response(JSON.stringify({ message: "Não autorizado." }), { status: 401 });
      }
      return new Response(JSON.stringify({
        user: { name: user.name, phone: user.phone },
        balanceCents: user.balanceCents
      }), { status: 200 });
    }

    // Route: Logout
    if (urlString === '/api/auth/logout' && method === 'POST') {
      localStorage.removeItem('user_session_phone');
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Route: Password change
    if (urlString === '/api/users/password' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { currentPassword, newPassword } = body;
      if (user.password !== currentPassword) {
        return new Response(JSON.stringify({ message: "Senha atual incorreta." }), { status: 400 });
      }
      db.users[user.phone].password = newPassword;
      saveDB(db);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Route: Public config
    if (urlString === '/api/public/config' && method === 'GET') {
      return new Response(JSON.stringify({
        entrada_valores: [3, 5, 10, 20, 50, 100],
        deposito_valores_rapidos: [20, 30, 50, 100, 200],
        deposito_botoes_labels: { "20": "MÍNIMO", "30": "QUENTE", "50": "+CHANCES", "100": "BÔNUS", "200": "BÔNUS" },
        deposito_botoes_cores: { "20": "#f59e0b", "30": "#ef4444", "50": "#22c55e", "100": "#8b5cf6", "200": "#8b5cf6" },
        fin: { deposito_minimo: 20, deposito_maximo: 10000, saque_minimo: 30, saque_afiliado_minimo: 30 }
      }), { status: 200 });
    }

    // Route: Deposit info
    if (urlString === '/api/wallet/deposit-info' && method === 'GET') {
      return new Response(JSON.stringify({
        elegivel: true, bonus_minimo: 20, bonus_maximo: 500, bonus_percentual: 50
      }), { status: 200 });
    }

    // Route: Wallet details
    if (urlString === '/api/wallet/' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const userTxs = db.transactions.filter(tx => tx.phone === user.phone);
      return new Response(JSON.stringify({
        balanceCents: user.balanceCents,
        transactions: userTxs
      }), { status: 200 });
    }

    // Route: Create deposit PIX
    if (urlString === '/api/wallet/deposit' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { amountCents } = body;
      if (!amountCents || amountCents < 2000) {
        return new Response(JSON.stringify({ message: "Valor mínimo de R$ 20,00" }), { status: 400 });
      }

      const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const pixCode = `00020101021126580014br.gov.bcb.pix0136blockwin-simulated-keys-pix-keys0218BlockWin Game Play5204000053039865405${(amountCents / 100).toFixed(2)}5802BR5915BLOCKWIN JOGOS6009SAO PAULO62170513${txid}6304FC3C`;
      const qrcode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

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
      saveDB(db);

      return new Response(JSON.stringify({
        balanceCents: user.balanceCents,
        pixCode: pixCode,
        qrcode: qrcode,
        txid: txid
      }), { status: 200 });
    }

    // Route: Withdraw balance
    if (urlString === '/api/wallet/withdraw' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { amountCents, pixKey, typePix } = body;
      if (!amountCents || amountCents < 3000) {
        return new Response(JSON.stringify({ message: "Saque mínimo de R$ 30,00" }), { status: 400 });
      }

      const dbUser = db.users[user.phone];
      if (dbUser.balanceCents < amountCents) {
        return new Response(JSON.stringify({ message: "Saldo insuficiente." }), { status: 400 });
      }

      dbUser.balanceCents -= amountCents;
      const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
      db.transactions.push({
        id: txid,
        phone: user.phone,
        type: 'WITHDRAW',
        status: 'COMPLETED',
        amountCents: amountCents,
        pixKey,
        typePix,
        txid,
        createdAt: new Date().toISOString()
      });
      saveDB(db);

      return new Response(JSON.stringify({ balanceCents: dbUser.balanceCents }), { status: 200 });
    }

    // Route: Withdraw affiliate commission
    if (urlString === '/api/wallet/withdraw-affiliate' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { amountCents, pixKey, typePix } = body;
      if (!amountCents || amountCents < 3000) {
        return new Response(JSON.stringify({ message: "Saque mínimo de R$ 30,00" }), { status: 400 });
      }

      const dbUser = db.users[user.phone];
      if (dbUser.comissao_saldo_cents < amountCents) {
        return new Response(JSON.stringify({ message: "Saldo insuficiente." }), { status: 400 });
      }

      dbUser.comissao_saldo_cents -= amountCents;
      const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
      db.transactions.push({
        id: txid,
        phone: user.phone,
        type: 'WITHDRAW_AFFILIATE',
        status: 'COMPLETED',
        amountCents: amountCents,
        pixKey,
        typePix,
        txid,
        createdAt: new Date().toISOString()
      });
      saveDB(db);

      return new Response(JSON.stringify({ balanceCents: dbUser.balanceCents }), { status: 200 });
    }

    // Route: Coupon redeem
    if (urlString === '/api/cupons/resgatar' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { codigo } = body;
      const codeUpper = (codigo || '').trim().toUpperCase();
      if (codeUpper !== 'BLOCK10' && codeUpper !== 'GANHE20') {
        return new Response(JSON.stringify({ message: "Cupom inválido ou expirado." }), { status: 400 });
      }

      const dbUser = db.users[user.phone];
      const userTxs = db.transactions.filter(tx => tx.phone === user.phone && tx.type === 'DEPOSIT' && tx.pixKey === `CUPOM:${codeUpper}`);
      if (userTxs.length > 0) {
        return new Response(JSON.stringify({ message: "Cupom já resgatado." }), { status: 400 });
      }

      const rewardCents = codeUpper === 'BLOCK10' ? 1000 : 2000;
      dbUser.balanceCents += rewardCents;
      const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
      db.transactions.push({
        id: txid,
        phone: user.phone,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        amountCents: rewardCents,
        pixKey: `CUPOM:${codeUpper}`,
        txid,
        createdAt: new Date().toISOString()
      });
      saveDB(db);

      return new Response(JSON.stringify({
        balanceCents: dbUser.balanceCents,
        transaction: { status: 'COMPLETED' }
      }), { status: 200 });
    }

    // Route: Affiliate info
    if (urlString === '/api/users/referrals' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      return new Response(JSON.stringify({
        refCode: user.referralCode,
        link: `${window.location.origin}/cadastro?ref=${user.referralCode}`,
        commissionRate: 0.10,
        totalCommissionCents: user.totalCommissionCents,
        comissao_saldo_cents: user.comissao_saldo_cents,
        indicados_count: user.indicados_count
      }), { status: 200 });
    }

    if (urlString === '/api/indicacao/info' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const referralsList = Object.values(db.users).filter(u => u.referredBy === user.phone);
      
      let n1DepositedCents = 0;
      referralsList.forEach(ref => {
        const refDeposits = db.transactions.filter(t => t.phone === ref.phone && t.type === 'DEPOSIT' && t.status === 'COMPLETED');
        refDeposits.forEach(d => { n1DepositedCents += d.amountCents; });
      });

      return new Response(JSON.stringify({
        codigo: user.referralCode,
        link: `${window.location.origin}/cadastro?ref=${user.referralCode}`,
        comissao_nivel1_perc: 10,
        total_comissao_cents: user.totalCommissionCents,
        saldo_cents: user.comissao_saldo_cents,
        indicados_count: user.indicados_count,
        n1Count: referralsList.length,
        n1DepositedCents: n1DepositedCents,
        n2Count: 0,
        n2DepositedCents: 0,
        history: referralsList.map(r => ({ name: r.name, createdAt: new Date().toISOString(), status: 'Ativo' }))
      }), { status: 200 });
    }

    // Route: Game config
    if (urlString === '/api/game/config' && method === 'GET') {
      return new Response(JSON.stringify({
        targetMultiplier: 2.0,
        ratePerLine: 0.10,
        minBetCents: 300,
        maxBetCents: 10000,
        entrada_valores: [3, 5, 10, 20, 50, 100]
      }), { status: 200 });
    }

    // Route: Active Game session
    if (urlString === '/api/game/active' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const activeGame = Object.values(db.games).find(g => g.phone === user.phone && g.status === 'ACTIVE');
      return new Response(JSON.stringify({ session: activeGame || null }), { status: 200 });
    }

    // Route: Start Game
    if (urlString === '/api/game/start' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { betCents } = body;
      if (!betCents || betCents < 100) {
        return new Response(JSON.stringify({ message: "Aposta mínima de R$ 1,00" }), { status: 400 });
      }

      const dbUser = db.users[user.phone];
      if (dbUser.balanceCents < betCents) {
        return new Response(JSON.stringify({ message: "Saldo insuficiente. Faça um depósito no painel." }), { status: 400 });
      }

      // Forfeit previous active game
      const oldActiveGame = Object.values(db.games).find(g => g.phone === user.phone && g.status === 'ACTIVE');
      if (oldActiveGame) {
        oldActiveGame.status = 'LOST';
      }

      dbUser.balanceCents -= betCents;

      const gameId = 'G' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const targetMultiplier = 2.0;
      const newGame = {
        id: gameId,
        phone: user.phone,
        status: 'ACTIVE',
        betCents: betCents,
        accumulatedCents: 0,
        targetCents: Math.round(betCents * targetMultiplier),
        targetMultiplier: targetMultiplier,
        board: Array(8).fill(0).map(() => Array(8).fill(0)),
        tray: generateTray(),
        createdAt: new Date().toISOString()
      };

      db.games[gameId] = newGame;
      saveDB(db);

      return new Response(JSON.stringify({ session: newGame }), { status: 200 });
    }

    // Route: Placed a piece move
    if (urlString.startsWith('/api/game/') && urlString.endsWith('/move') && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const parts = urlString.split('/');
      const gameId = parts[3]; // /api/game/{id}/move

      const game = db.games[gameId];
      if (!game || game.phone !== user.phone || game.status !== 'ACTIVE') {
        return new Response(JSON.stringify({ message: "Partida inválida." }), { status: 400 });
      }

      const { pieceIndex, row, col } = body;
      const piece = game.tray[pieceIndex];
      if (!piece || !piece.available) {
        return new Response(JSON.stringify({ message: "Peça indisponível." }), { status: 400 });
      }

      if (!canPlacePiece(game.board, piece.cells, row, col)) {
        return new Response(JSON.stringify({ message: "Posição inválida." }), { status: 400 });
      }

      // Apply block
      game.board = applyPiece(game.board, piece.cells, row, col, piece.colorId);
      piece.available = false;

      // Lines clear check
      const cleared = getClearedLines(game.board);
      const clearedCount = cleared.rows.length + cleared.cols.length;
      let gainedCents = 0;

      if (clearedCount > 0) {
        gainedCents = Math.round(game.betCents * 0.10 * clearedCount);
        game.accumulatedCents += gainedCents;

        for (const r of cleared.rows) {
          for (let c = 0; c < 8; c++) game.board[r][c] = 0;
        }
        for (const c of cleared.cols) {
          for (let r = 0; r < 8; r++) game.board[r][c] = 0;
        }
      }

      // Draw new pieces if tray empty
      const allUsed = game.tray.every(p => !p.available);
      if (allUsed) {
        game.tray = generateTray();
      }

      // Game Over check
      let gameOver = true;
      for (const p of game.tray) {
        if (p.available && pieceCanFitAnywhere(game.board, p.cells, p.width, p.height)) {
          gameOver = false;
          break;
        }
      }

      if (gameOver) {
        game.status = 'LOST';
        db.users[user.phone].gamesPlayed += 1;
        db.history.push({
          id: game.id,
          phone: user.phone,
          betCents: game.betCents,
          accumulatedCents: game.accumulatedCents,
          status: 'LOST',
          createdAt: new Date().toISOString()
        });
      }

      saveDB(db);

      return new Response(JSON.stringify({
        clearedRows: cleared.rows,
        clearedCols: cleared.cols,
        gainedCents: gainedCents,
        gameOver: gameOver,
        session: game
      }), { status: 200 });
    }

    // Route: Cashout
    if (urlString.startsWith('/api/game/') && urlString.endsWith('/cashout') && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const parts = urlString.split('/');
      const gameId = parts[3];

      const game = db.games[gameId];
      if (!game || game.phone !== user.phone || game.status !== 'ACTIVE') {
        return new Response(JSON.stringify({ message: "Partida inválida." }), { status: 400 });
      }

      if (game.accumulatedCents < game.targetCents) {
        return new Response(JSON.stringify({ message: "Meta de resgate não atingida." }), { status: 400 });
      }

      game.status = 'CASHED_OUT';

      const dbUser = db.users[user.phone];
      dbUser.balanceCents += game.accumulatedCents;
      dbUser.gamesPlayed += 1;
      dbUser.gamesWon += 1;
      dbUser.totalWonCents += game.accumulatedCents;
      if (game.accumulatedCents > dbUser.biggestWinCents) {
        dbUser.biggestWinCents = game.accumulatedCents;
      }

      // Affiliate referral commission (10%)
      if (dbUser.referredBy) {
        const referrer = db.users[dbUser.referredBy];
        if (referrer) {
          const commission = Math.round(game.betCents * 0.10);
          referrer.comissao_saldo_cents += commission;
          referrer.totalCommissionCents += commission;
        }
      }

      db.history.push({
        id: game.id,
        phone: user.phone,
        betCents: game.betCents,
        accumulatedCents: game.accumulatedCents,
        status: 'CASHED_OUT',
        createdAt: new Date().toISOString()
      });

      saveDB(db);

      return new Response(JSON.stringify({ session: game }), { status: 200 });
    }

    // Route: Forfeit
    if (urlString === '/api/game/forfeit' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const activeGame = Object.values(db.games).find(g => g.phone === user.phone && g.status === 'ACTIVE');
      if (activeGame) {
        activeGame.status = 'LOST';
        db.users[user.phone].gamesPlayed += 1;
        db.history.push({
          id: activeGame.id,
          phone: user.phone,
          betCents: activeGame.betCents,
          accumulatedCents: activeGame.accumulatedCents,
          status: 'LOST',
          createdAt: new Date().toISOString()
        });
        saveDB(db);
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Route: History list
    if (urlString === '/api/game/history' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const userGames = db.history.filter(g => g.phone === user.phone);
      return new Response(JSON.stringify({
        games: userGames.map(g => ({
          id: g.id,
          betCents: g.betCents,
          payoutCents: g.status === 'CASHED_OUT' ? g.accumulatedCents : 0,
          status: g.status,
          createdAt: g.createdAt
        }))
      }), { status: 200 });
    }

    // Route: Stats
    if (urlString === '/api/users/stats' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      return new Response(JSON.stringify({
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        totalWonCents: user.totalWonCents,
        biggestWinCents: user.biggestWinCents
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: "Rota não encontrada no simulador." }), { status: 404 });
  };
})();
