(function() {
  const originalFetch = window.fetch;

  // Supabase Configuration
  const SUPABASE_URL = "https://knnartlkluqscwlirybv.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubmFydGxrbHVxc2N3bGlyeWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjAzODgsImV4cCI6MjEwMDE5NjM4OH0.JbdzBgxZPWnhv3SttMd5RBcocPMxFmPb6nSCuJ_JCQA";
  
  const supabaseHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  // Pieces definitions
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

  // Supabase Table Helpers
  async function dbGetProfile(phone) {
    try {
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/profiles?phone=eq.${phone}`, { headers: supabaseHeaders });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data[0] || null;
    } catch (e) {
      console.error("[Supabase Error] getProfile failed:", e);
      return null;
    }
  }

  async function dbCreateProfile(profile) {
    const res = await originalFetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error("Erro ao criar perfil no Supabase: " + await res.text());
    return true;
  }

  async function dbUpdateProfile(phone, updates) {
    const res = await originalFetch(`${SUPABASE_URL}/rest/v1/profiles?phone=eq.${phone}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Erro ao atualizar perfil no Supabase: " + await res.text());
    return true;
  }

  async function dbGetTransactions(phone) {
    try {
      const url = phone ? `${SUPABASE_URL}/rest/v1/transactions?phone=eq.${phone}&order=created_at.desc` : `${SUPABASE_URL}/rest/v1/transactions?order=created_at.desc`;
      const res = await originalFetch(url, { headers: supabaseHeaders });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  }

  async function dbCreateTransaction(tx) {
    const res = await originalFetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error("Erro ao registrar transação no Supabase: " + await res.text());
    return true;
  }

  async function dbUpdateTransaction(id, updates) {
    await originalFetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify(updates)
    });
  }

  async function dbGetActiveGame(phone) {
    try {
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/games?phone=eq.${phone}&status=eq.ACTIVE`, { headers: supabaseHeaders });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
    } catch (e) {
      return null;
    }
  }

  async function dbCreateGame(game) {
    const res = await originalFetch(`${SUPABASE_URL}/rest/v1/games`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(game)
    });
    if (!res.ok) throw new Error("Erro ao registrar jogo no Supabase: " + await res.text());
    return true;
  }

  async function dbUpdateGame(id, updates) {
    const res = await originalFetch(`${SUPABASE_URL}/rest/v1/games?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Erro ao salvar progresso no Supabase: " + await res.text());
    return true;
  }

  async function dbGetHistory(phone) {
    try {
      const url = phone ? `${SUPABASE_URL}/rest/v1/history?phone=eq.${phone}&order=created_at.desc` : `${SUPABASE_URL}/rest/v1/history?order=created_at.desc`;
      const res = await originalFetch(url, { headers: supabaseHeaders });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  }

  async function dbCreateHistoryEntry(entry) {
    await originalFetch(`${SUPABASE_URL}/rest/v1/history`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(entry)
    });
  }

  // Get/Save game config
  async function dbGetGameConfig() {
    try {
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/config?key=eq.game_settings`, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data[0] && data[0].value) {
          const val = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
          return val;
        }
      }
    } catch (e) {}
    // Default fallback settings
    return {
      targetMultiplier: 2.0,
      ratePerLine: 0.10,
      minBetCents: 300,
      maxBetCents: 10000,
      entrada_valores: [3, 5, 10, 20, 50, 100],
      globalDifficulty: 'NORMAL',
      globalRtpPercent: 80
    };
  }

  // Session Helper
  async function getLoggedUser() {
    const phone = localStorage.getItem('user_session_phone');
    if (!phone) return null;
    return await dbGetProfile(phone);
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

  // Smart Piece Drawer based on Retention Difficulty
  function drawPiecesForDifficulty(board, difficulty) {
    const tray = [];
    for (let i = 0; i < 3; i++) {
      let piece;
      if (difficulty === 'EASY') {
        // Small easy pieces: 1x1, 1x2, 2x1, 2x2, 1x3
        const easyTemplates = PIECES_TEMPLATES.filter(p => p.cells.length <= 4 && p.width <= 2 && p.height <= 2);
        const template = easyTemplates[Math.floor(Math.random() * easyTemplates.length)] || PIECES_TEMPLATES[0];
        piece = template;
      } else if (difficulty === 'HARD') {
        // Large hard pieces: 3x3 square, 5x1 line, 1x5 line, L-shapes
        const hardTemplates = PIECES_TEMPLATES.filter(p => p.cells.length >= 4 || p.width >= 3 || p.height >= 3);
        const template = hardTemplates[Math.floor(Math.random() * hardTemplates.length)] || PIECES_TEMPLATES[0];
        piece = template;
      } else if (difficulty === 'FORCE_LOSS') {
        // Draw a piece that CANNOT fit anywhere on the current board
        let foundBlocked = null;
        for (let attempt = 0; attempt < 50; attempt++) {
          const t = PIECES_TEMPLATES[Math.floor(Math.random() * PIECES_TEMPLATES.length)];
          if (!pieceCanFitAnywhere(board, t.cells, t.width, t.height)) {
            foundBlocked = t;
            break;
          }
        }
        // Fallback to random if board is too empty
        piece = foundBlocked || PIECES_TEMPLATES[Math.floor(Math.random() * PIECES_TEMPLATES.length)];
      } else {
        // NORMAL
        piece = PIECES_TEMPLATES[Math.floor(Math.random() * PIECES_TEMPLATES.length)];
      }
      
      tray.push({
        cells: piece.cells,
        width: piece.width,
        height: piece.height,
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

  // Auto approve deposits in background (Supabase polling)
  setInterval(async () => {
    try {
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/transactions?type=eq.DEPOSIT&status=eq.PENDING`, { headers: supabaseHeaders });
      if (!res.ok) return;
      const pendingTxs = await res.json();
      const now = Date.now();

      for (const tx of pendingTxs) {
        const elapsed = now - new Date(tx.created_at).getTime();
        if (elapsed >= 5000) {
          console.log(`[Supabase Mock API] Approving deposit ${tx.id}...`);
          await dbUpdateTransaction(tx.id, { status: 'COMPLETED' });
          const profile = await dbGetProfile(tx.phone);
          if (profile) {
            const newBalance = Number(profile.balance_cents) + Number(tx.amount_cents);
            await dbUpdateProfile(tx.phone, { balance_cents: newBalance });
            console.log(`[Supabase Mock API] Credited R$ ${(tx.amount_cents / 100).toFixed(2)} to ${tx.phone}`);
          }
        }
      }
    } catch (e) {}
  }, 3000);

  // Network Fetch Interceptor
  window.fetch = async function(url, options = {}) {
    let urlString = typeof url === 'string' ? url : url.url;
    
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      const parsed = new URL(urlString);
      urlString = parsed.pathname;
    }

    if (!urlString.startsWith('/api/')) {
      return originalFetch.apply(window, arguments);
    }

    const method = (options.method || 'GET').toUpperCase();
    let body = {};
    if (options.body) {
      try {
        body = JSON.parse(options.body);
      } catch (e) {}
    }

    console.log(`[Supabase Mock API Intercept] ${method} ${urlString}`, body);

    const user = await getLoggedUser();

    function handleSchemaError(err) {
      console.error(err);
      return new Response(JSON.stringify({ 
        error: { 
          message: "Erro no banco de dados. Certifique-se de que executou o script SQL de atualização no painel do Supabase e desativou a segurança RLS." 
        } 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Register
    if (urlString === '/api/auth/register' && method === 'POST') {
      const { name, phone, password, referralCode } = body;
      if (!name || !phone || !password) {
        return new Response(JSON.stringify({ message: "Preencha todos os campos." }), { status: 400 });
      }
      const cleanPhone = phone.replace(/\D/g, '');
      
      try {
        const existingProfile = await dbGetProfile(cleanPhone);
        if (existingProfile) {
          return new Response(JSON.stringify({ message: "Telefone já cadastrado." }), { status: 400 });
        }

        const referralCodeGenerated = Math.random().toString(36).substring(2, 10).toUpperCase();
        const newUser = {
          name: name.trim(),
          phone: cleanPhone,
          password: password,
          referral_code: referralCodeGenerated,
          balance_cents: 0,
          comissao_saldo_cents: 0,
          total_commission_cents: 0,
          indicados_count: 0,
          games_played: 0,
          games_won: 0,
          total_won_cents: 0,
          biggest_win_cents: 0,
          referred_by: null,
          role: 'USER',
          difficulty_override: 'DEFAULT',
          custom_commission_rate: null
        };

        if (referralCode) {
          const resRef = await originalFetch(`${SUPABASE_URL}/rest/v1/profiles?referral_code=eq.${referralCode.trim().toUpperCase()}`, { headers: supabaseHeaders });
          if (resRef.ok) {
            const dataRef = await resRef.json();
            const referrer = dataRef[0];
            if (referrer) {
              newUser.referred_by = referrer.phone;
              await dbUpdateProfile(referrer.phone, { indicados_count: referrer.indicados_count + 1 });
            }
          }
        }

        await dbCreateProfile(newUser);
        localStorage.setItem('user_session_phone', cleanPhone);

        return new Response(JSON.stringify({
          user: { name: newUser.name, phone: newUser.phone },
          balanceCents: 0
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Login
    if (urlString === '/api/auth/login' && method === 'POST') {
      const { phone, password } = body;
      if (!phone || !password) {
        return new Response(JSON.stringify({ message: "Informe telefone e senha." }), { status: 400 });
      }
      const cleanPhone = phone.replace(/\D/g, '');
      
      try {
        const dbUser = await dbGetProfile(cleanPhone);
        if (!dbUser || dbUser.password !== password) {
          return new Response(JSON.stringify({ message: "Telefone ou senha incorretos." }), { status: 400 });
        }

        localStorage.setItem('user_session_phone', cleanPhone);
        return new Response(JSON.stringify({
          user: { name: dbUser.name, phone: dbUser.phone },
          balanceCents: Number(dbUser.balance_cents)
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Me
    if (urlString === '/api/auth/me' && method === 'GET') {
      if (!user) {
        return new Response(JSON.stringify({ message: "Não autorizado." }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({
        user: { name: user.name, phone: user.phone },
        balanceCents: Number(user.balance_cents)
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Logout
    if (urlString === '/api/auth/logout' && method === 'POST') {
      localStorage.removeItem('user_session_phone');
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Password change
    if (urlString === '/api/users/password' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { currentPassword, newPassword } = body;
      if (user.password !== currentPassword) {
        return new Response(JSON.stringify({ message: "Senha atual incorreta." }), { status: 400 });
      }
      try {
        await dbUpdateProfile(user.phone, { password: newPassword });
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Public config
    if (urlString === '/api/public/config' && method === 'GET') {
      const config = await dbGetGameConfig();
      return new Response(JSON.stringify({
        entrada_valores: config.entrada_valores || [3, 5, 10, 20, 50, 100],
        deposito_valores_rapidos: [20, 30, 50, 100, 200],
        deposito_botoes_labels: { "20": "MÍNIMO", "30": "QUENTE", "50": "+CHANCES", "100": "BÔNUS", "200": "BÔNUS" },
        deposito_botoes_cores: { "20": "#f59e0b", "30": "#ef4444", "50": "#22c55e", "100": "#8b5cf6", "200": "#8b5cf6" },
        fin: { deposito_minimo: 20, deposito_maximo: 10000, saque_minimo: config.minBetCents ? Math.round(config.minBetCents / 100) : 30, saque_afiliado_minimo: 30 }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Deposit info
    if (urlString === '/api/wallet/deposit-info' && method === 'GET') {
      return new Response(JSON.stringify({
        elegivel: true, bonus_minimo: 20, bonus_maximo: 500, bonus_percentual: 50
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Wallet details
    if (urlString === '/api/wallet/' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      try {
        const txs = await dbGetTransactions(user.phone);
        return new Response(JSON.stringify({
          balanceCents: Number(user.balance_cents),
          transactions: txs.map(t => ({
            id: t.id,
            phone: t.phone,
            type: t.type,
            status: t.status,
            amountCents: Number(t.amount_cents),
            pixCode: t.pix_code,
            qrcode: t.qrcode,
            txid: t.txid,
            createdAt: t.created_at
          }))
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
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
        amount_cents: amountCents,
        pix_code: pixCode,
        qrcode: qrcode,
        txid: txid
      };

      try {
        await dbCreateTransaction(newTx);
        return new Response(JSON.stringify({
          balanceCents: Number(user.balance_cents),
          pixCode: pixCode,
          qrcode: qrcode,
          txid: txid
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Withdraw balance
    if (urlString === '/api/wallet/withdraw' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { amountCents, pixKey, typePix } = body;
      if (!amountCents || amountCents < 3000) {
        return new Response(JSON.stringify({ message: "Saque mínimo de R$ 30,00" }), { status: 400 });
      }

      if (Number(user.balance_cents) < amountCents) {
        return new Response(JSON.stringify({ message: "Saldo insuficiente." }), { status: 400 });
      }

      try {
        const newBalance = Number(user.balance_cents) - amountCents;
        await dbUpdateProfile(user.phone, { balance_cents: newBalance });

        const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
        await dbCreateTransaction({
          id: txid,
          phone: user.phone,
          type: 'WITHDRAW',
          status: 'COMPLETED',
          amount_cents: amountCents,
          pix_key: pixKey,
          type_pix: typePix,
          txid: txid
        });

        return new Response(JSON.stringify({ balanceCents: newBalance }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Withdraw affiliate commission
    if (urlString === '/api/wallet/withdraw-affiliate' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { amountCents, pixKey, typePix } = body;
      if (!amountCents || amountCents < 3000) {
        return new Response(JSON.stringify({ message: "Saque mínimo de R$ 30,00" }), { status: 400 });
      }

      if (Number(user.comissao_saldo_cents) < amountCents) {
        return new Response(JSON.stringify({ message: "Saldo insuficiente." }), { status: 400 });
      }

      try {
        const newCommBalance = Number(user.comissao_saldo_cents) - amountCents;
        await dbUpdateProfile(user.phone, { comissao_saldo_cents: newCommBalance });

        const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
        await dbCreateTransaction({
          id: txid,
          phone: user.phone,
          type: 'WITHDRAW_AFFILIATE',
          status: 'COMPLETED',
          amount_cents: amountCents,
          pix_key: pixKey,
          type_pix: typePix,
          txid: txid
        });

        return new Response(JSON.stringify({ balanceCents: Number(user.balance_cents) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Coupon redeem (dynamic checking Supabase coupons table)
    if (urlString === '/api/cupons/resgatar' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { codigo } = body;
      const codeUpper = (codigo || '').trim().toUpperCase();
      
      try {
        // Query coupon in Supabase
        const resCoupon = await originalFetch(`${SUPABASE_URL}/rest/v1/coupons?code=eq.${codeUpper}`, { headers: supabaseHeaders });
        if (!resCoupon.ok) {
          return new Response(JSON.stringify({ message: "Cupom inválido ou expirado." }), { status: 400 });
        }
        
        const couponsData = await resCoupon.json();
        const coupon = couponsData[0];
        
        if (!coupon || Number(coupon.uses_count) >= Number(coupon.max_uses)) {
          return new Response(JSON.stringify({ message: "Cupom esgotado ou inválido." }), { status: 400 });
        }

        const txs = await dbGetTransactions(user.phone);
        const alreadyRedeemed = txs.some(t => t.type === 'DEPOSIT' && t.pix_key === `CUPOM:${codeUpper}`);
        if (alreadyRedeemed) {
          return new Response(JSON.stringify({ message: "Cupom já resgatado por você." }), { status: 400 });
        }

        const rewardCents = Number(coupon.amount_cents);
        const newBalance = Number(user.balance_cents) + rewardCents;
        
        await dbUpdateProfile(user.phone, { balance_cents: newBalance });

        // Update coupon count
        await originalFetch(`${SUPABASE_URL}/rest/v1/coupons?code=eq.${codeUpper}`, {
          method: 'PATCH',
          headers: supabaseHeaders,
          body: JSON.stringify({ uses_count: Number(coupon.uses_count) + 1 })
        });

        const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
        await dbCreateTransaction({
          id: txid,
          phone: user.phone,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount_cents: rewardCents,
          pix_key: `CUPOM:${codeUpper}`,
          txid
        });

        return new Response(JSON.stringify({
          balanceCents: newBalance,
          transaction: { status: 'COMPLETED' }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Affiliate info
    if (urlString === '/api/users/referrals' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const commRate = user.custom_commission_rate !== null ? Number(user.custom_commission_rate) : 0.10;
      return new Response(JSON.stringify({
        refCode: user.referral_code,
        link: `${window.location.origin}/cadastro?ref=${user.referral_code}`,
        commissionRate: commRate,
        totalCommissionCents: Number(user.total_commission_cents),
        comissao_saldo_cents: Number(user.comissao_saldo_cents),
        indicados_count: user.indicados_count
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlString === '/api/indicacao/info' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      try {
        const resRef = await originalFetch(`${SUPABASE_URL}/rest/v1/profiles?referred_by=eq.${user.phone}`, { headers: supabaseHeaders });
        const referralsList = resRef.ok ? await resRef.json() : [];
        
        let n1DepositedCents = 0;
        for (const ref of referralsList) {
          const txs = await dbGetTransactions(ref.phone);
          const completed = txs.filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED');
          completed.forEach(d => { n1DepositedCents += Number(d.amount_cents); });
        }

        const commPercent = user.custom_commission_rate !== null ? Math.round(Number(user.custom_commission_rate) * 100) : 10;

        return new Response(JSON.stringify({
          codigo: user.referral_code,
          link: `${window.location.origin}/cadastro?ref=${user.referral_code}`,
          comissao_nivel1_perc: commPercent,
          total_comissao_cents: Number(user.total_commission_cents),
          saldo_cents: Number(user.comissao_saldo_cents),
          indicados_count: user.indicados_count,
          n1Count: referralsList.length,
          n1DepositedCents: n1DepositedCents,
          n2Count: 0,
          n2DepositedCents: 0,
          history: referralsList.map(r => ({ name: r.name, createdAt: r.created_at, status: 'Ativo' }))
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Game config
    if (urlString === '/api/game/config' && method === 'GET') {
      const config = await dbGetGameConfig();
      return new Response(JSON.stringify({
        targetMultiplier: Number(config.targetMultiplier),
        ratePerLine: Number(config.ratePerLine),
        minBetCents: Number(config.minBetCents),
        maxBetCents: Number(config.maxBetCents),
        entrada_valores: config.entrada_valores || [3, 5, 10, 20, 50, 100]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Active Game session
    if (urlString === '/api/game/active' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      try {
        const activeGame = await dbGetActiveGame(user.phone);
        if (activeGame) {
          activeGame.board = typeof activeGame.board === 'string' ? JSON.parse(activeGame.board) : activeGame.board;
          activeGame.tray = typeof activeGame.tray === 'string' ? JSON.parse(activeGame.tray) : activeGame.tray;
          activeGame.betCents = Number(activeGame.bet_cents);
          activeGame.accumulatedCents = Number(activeGame.accumulated_cents);
          activeGame.targetCents = Number(activeGame.target_cents);
          activeGame.targetMultiplier = Number(activeGame.target_multiplier);
        }
        return new Response(JSON.stringify({ session: activeGame || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Start Game
    if (urlString === '/api/game/start' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { betCents } = body;
      if (!betCents || betCents < 100) {
        return new Response(JSON.stringify({ message: "Aposta mínima de R$ 1,00" }), { status: 400 });
      }

      if (Number(user.balance_cents) < betCents) {
        return new Response(JSON.stringify({ message: "Saldo insuficiente. Faça um depósito no painel." }), { status: 400 });
      }

      try {
        const config = await dbGetGameConfig();
        const oldActiveGame = await dbGetActiveGame(user.phone);
        if (oldActiveGame) {
          await dbUpdateGame(oldActiveGame.id, { status: 'LOST' });
          await dbCreateHistoryEntry({
            id: oldActiveGame.id,
            phone: user.phone,
            bet_cents: Number(oldActiveGame.bet_cents),
            accumulated_cents: Number(oldActiveGame.accumulated_cents),
            status: 'LOST'
          });
        }

        const newBalance = Number(user.balance_cents) - betCents;
        await dbUpdateProfile(user.phone, { balance_cents: newBalance });

        const gameId = 'G' + Math.random().toString(36).substring(2, 11).toUpperCase();
        const targetMultiplier = Number(config.targetMultiplier) || 2.0;
        
        // Check difficulty level (Personal override or global default)
        const activeDifficulty = user.difficulty_override !== 'DEFAULT' ? user.difficulty_override : (config.globalDifficulty || 'NORMAL');
        const emptyBoard = Array(8).fill(0).map(() => Array(8).fill(0));

        const newGame = {
          id: gameId,
          phone: user.phone,
          status: 'ACTIVE',
          bet_cents: betCents,
          accumulated_cents: 0,
          target_cents: Math.round(betCents * targetMultiplier),
          target_multiplier: targetMultiplier,
          board: emptyBoard,
          tray: drawPiecesForDifficulty(emptyBoard, activeDifficulty) // initial pieces
        };

        await dbCreateGame(newGame);

        const mappedGame = {
          id: newGame.id,
          phone: newGame.phone,
          status: newGame.status,
          betCents: newGame.bet_cents,
          accumulatedCents: newGame.accumulated_cents,
          targetCents: newGame.target_cents,
          targetMultiplier: newGame.target_multiplier,
          board: newGame.board,
          tray: newGame.tray
        };

        return new Response(JSON.stringify({ session: mappedGame }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Placed a piece move
    if (urlString.startsWith('/api/game/') && urlString.endsWith('/move') && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const parts = urlString.split('/');
      const gameId = parts[3];

      try {
        const game = await dbGetActiveGame(user.phone);
        if (!game || game.id !== gameId) {
          return new Response(JSON.stringify({ message: "Partida inválida." }), { status: 400 });
        }

        const config = await dbGetGameConfig();
        const rate = Number(config.ratePerLine) || 0.10;

        game.board = typeof game.board === 'string' ? JSON.parse(game.board) : game.board;
        game.tray = typeof game.tray === 'string' ? JSON.parse(game.tray) : game.tray;
        game.betCents = Number(game.bet_cents);
        game.accumulatedCents = Number(game.accumulated_cents);
        game.targetCents = Number(game.target_cents);

        const { pieceIndex, row, col } = body;
        const piece = game.tray[pieceIndex];
        if (!piece || !piece.available) {
          return new Response(JSON.stringify({ message: "Peça indisponível." }), { status: 400 });
        }

        if (!canPlacePiece(game.board, piece.cells, row, col)) {
          return new Response(JSON.stringify({ message: "Posição inválida." }), { status: 400 });
        }

        game.board = applyPiece(game.board, piece.cells, row, col, piece.colorId);
        piece.available = false;

        const cleared = getClearedLines(game.board);
        const clearedCount = cleared.rows.length + cleared.cols.length;
        let gainedCents = 0;

        if (clearedCount > 0) {
          gainedCents = Math.round(game.betCents * rate * clearedCount);
          game.accumulatedCents += gainedCents;

          for (const r of cleared.rows) {
            for (let c = 0; c < 8; c++) game.board[r][c] = 0;
          }
          for (const c of cleared.cols) {
            for (let r = 0; r < 8; r++) game.board[r][c] = 0;
          }
        }

        // Draw new pieces if tray empty (smart drawer applying difficulty override or global default)
        const allUsed = game.tray.every(p => !p.available);
        if (allUsed) {
          const activeDifficulty = user.difficulty_override !== 'DEFAULT' ? user.difficulty_override : (config.globalDifficulty || 'NORMAL');
          game.tray = drawPiecesForDifficulty(game.board, activeDifficulty);
        }

        let gameOver = true;
        for (const p of game.tray) {
          if (p.available && pieceCanFitAnywhere(game.board, p.cells, p.width, p.height)) {
            gameOver = false;
            break;
          }
        }

        const updates = {
          board: game.board,
          tray: game.tray,
          accumulated_cents: game.accumulatedCents
        };

        if (gameOver) {
          updates.status = 'LOST';
          const newPlayedCount = Number(user.games_played) + 1;
          await dbUpdateProfile(user.phone, { games_played: newPlayedCount });
          await dbCreateHistoryEntry({
            id: game.id,
            phone: user.phone,
            bet_cents: game.betCents,
            accumulated_cents: game.accumulatedCents,
            status: 'LOST'
          });
        }

        await dbUpdateGame(game.id, updates);

        const mappedGame = {
          id: game.id,
          phone: game.phone,
          status: gameOver ? 'LOST' : game.status,
          betCents: game.betCents,
          accumulatedCents: game.accumulatedCents,
          targetCents: game.targetCents,
          targetMultiplier: Number(game.target_multiplier),
          board: game.board,
          tray: game.tray
        };

        return new Response(JSON.stringify({
          clearedRows: cleared.rows,
          clearedCols: cleared.cols,
          gainedCents: gainedCents,
          gameOver: gameOver,
          session: mappedGame
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Cashout
    if (urlString.startsWith('/api/game/') && urlString.endsWith('/cashout') && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const parts = urlString.split('/');
      const gameId = parts[3];

      try {
        const game = await dbGetActiveGame(user.phone);
        if (!game || game.id !== gameId) {
          return new Response(JSON.stringify({ message: "Partida inválida." }), { status: 400 });
        }

        game.accumulatedCents = Number(game.accumulated_cents);
        game.targetCents = Number(game.target_cents);
        game.betCents = Number(game.bet_cents);

        if (game.accumulatedCents < game.targetCents) {
          return new Response(JSON.stringify({ message: "Meta de resgate não atingida." }), { status: 400 });
        }

        await dbUpdateGame(game.id, { status: 'CASHED_OUT' });

        const newBalance = Number(user.balance_cents) + game.accumulatedCents;
        const newPlayedCount = Number(user.games_played) + 1;
        const newWonCount = Number(user.games_won) + 1;
        const newTotalWon = Number(user.total_won_cents) + game.accumulatedCents;
        const biggestWin = game.accumulatedCents > Number(user.biggest_win_cents) ? game.accumulatedCents : Number(user.biggest_win_cents);

        await dbUpdateProfile(user.phone, {
          balance_cents: newBalance,
          games_played: newPlayedCount,
          games_won: newWonCount,
          total_won_cents: newTotalWon,
          biggest_win_cents: biggestWin
        });

        // Referral commission logic using user's custom rate or standard 10%
        if (user.referred_by) {
          const referrer = await dbGetProfile(user.referred_by);
          if (referrer) {
            const commRate = referrer.custom_commission_rate !== null ? Number(referrer.custom_commission_rate) : 0.10;
            const commission = Math.round(game.betCents * commRate);
            await dbUpdateProfile(referrer.phone, {
              comissao_saldo_cents: Number(referrer.comissao_saldo_cents) + commission,
              total_commission_cents: Number(referrer.total_commission_cents) + commission
            });
          }
        }

        await dbCreateHistoryEntry({
          id: game.id,
          phone: user.phone,
          bet_cents: game.betCents,
          accumulated_cents: game.accumulatedCents,
          status: 'CASHED_OUT'
        });

        const mappedGame = {
          id: game.id,
          phone: game.phone,
          status: 'CASHED_OUT',
          betCents: game.betCents,
          accumulatedCents: game.accumulatedCents,
          targetCents: game.targetCents,
          targetMultiplier: Number(game.target_multiplier),
          board: typeof game.board === 'string' ? JSON.parse(game.board) : game.board,
          tray: typeof game.tray === 'string' ? JSON.parse(game.tray) : game.tray
        };

        return new Response(JSON.stringify({ session: mappedGame }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Forfeit
    if (urlString === '/api/game/forfeit' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      try {
        const activeGame = await dbGetActiveGame(user.phone);
        if (activeGame) {
          await dbUpdateGame(activeGame.id, { status: 'LOST' });
          const newPlayedCount = Number(user.games_played) + 1;
          await dbUpdateProfile(user.phone, { games_played: newPlayedCount });

          await dbCreateHistoryEntry({
            id: activeGame.id,
            phone: user.phone,
            bet_cents: Number(activeGame.bet_cents),
            accumulated_cents: Number(activeGame.accumulated_cents),
            status: 'LOST'
          });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: History list
    if (urlString === '/api/game/history' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      try {
        const historyList = await dbGetHistory(user.phone);
        return new Response(JSON.stringify({
          games: historyList.map(g => ({
            id: g.id,
            betCents: Number(g.bet_cents),
            payoutCents: g.status === 'CASHED_OUT' ? Number(g.accumulated_cents) : 0,
            status: g.status,
            createdAt: g.created_at
          }))
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Stats
    if (urlString === '/api/users/stats' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      return new Response(JSON.stringify({
        gamesPlayed: user.games_played,
        gamesWon: user.games_won,
        totalWonCents: Number(user.total_won_cents),
        biggestWinCents: Number(user.biggest_win_cents)
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: "Rota não encontrada no simulador." }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  };

  // ==========================================
  // EXPANDED ADMIN PANEL INTERCEPTOR (/adminlgn)
  // ==========================================
  
  if (window.location.pathname === '/adminlgn') {
    window.stop();
    
    document.documentElement.innerHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Painel Admin Profissional | Block Win</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg: #070913;
            --bg-card: rgba(22, 28, 45, 0.6);
            --border: rgba(255, 255, 255, 0.08);
            --accent: #3b82f6;
            --accent-glow: rgba(59, 130, 246, 0.25);
            --text: #f8fafc;
            --text-dim: #94a3b8;
            --success: #10b981;
            --danger: #ef4444;
            --gold: #f59e0b;
            --purple: #8b5cf6;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
          body { background-color: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
          
          /* Login Screen */
          #login-container {
            display: flex; align-items: center; justify-content: center; min-height: 100vh;
            background: radial-gradient(circle at top right, var(--accent-glow) 0%, transparent 40%);
          }
          .login-card {
            background: var(--bg-card); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 400px; padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;
          }
          .login-card h2 { font-size: 1.8rem; margin-bottom: 8px; font-weight: 700; color: var(--text); }
          .login-card p { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 30px; }
          .form-group { text-align: left; margin-bottom: 20px; }
          .form-group label { display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
          .form-control { width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; color: var(--text); font-size: 1rem; outline: none; transition: 0.3s; }
          .form-control:focus { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }
          .btn-login { width: 100%; background: var(--accent); border: none; border-radius: 10px; padding: 14px; color: var(--text); font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.3s; margin-top: 10px; }
          .btn-login:hover { background: #60a5fa; transform: translateY(-2px); box-shadow: 0 5px 15px var(--accent-glow); }
          .error-msg { color: var(--danger); font-size: 0.9rem; margin-top: 15px; display: none; }

          /* Dashboard Layout */
          #dashboard-container { display: none; min-height: 100vh; flex-direction: column; }
          header { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid var(--border); background: rgba(7, 9, 19, 0.85); backdrop-filter: blur(10px); z-index: 10; position: sticky; top: 0; }
          .header-brand { display: flex; align-items: center; gap: 10px; }
          .header-brand h1 { font-size: 1.4rem; font-weight: 700; background: linear-gradient(90deg, #60a5fa, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .badge-admin { background: var(--accent-glow); border: 1px solid var(--accent); color: #93c5fd; font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
          .btn-logout { background: transparent; border: 1px solid var(--border); color: var(--text-dim); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s; }
          .btn-logout:hover { border-color: var(--danger); color: var(--text); background: rgba(239, 68, 68, 0.1); }

          .dashboard-main { flex: 1; display: flex; }
          .sidebar { width: 260px; border-right: 1px solid var(--border); padding: 30px 15px; background: rgba(15, 23, 42, 0.3); }
          .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 18px; color: var(--text-dim); text-decoration: none; border-radius: 10px; font-weight: 600; margin-bottom: 8px; cursor: pointer; transition: 0.3s; }
          .nav-item:hover { color: var(--text); background: rgba(255, 255, 255, 0.03); }
          .nav-item.active { color: var(--text); background: var(--accent-glow); border: 1px solid rgba(59, 130, 246, 0.3); }
          
          .content-area { flex: 1; padding: 40px; }
          .tab-content { display: none; }
          .tab-content.active { display: block; }

          /* Stats cards */
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
          .stat-card { background: var(--bg-card); border: 1px solid var(--border); padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
          .stat-card .label { font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px; }
          .stat-card .value { font-size: 2rem; font-weight: 700; color: var(--text); }
          .stat-card .value.hl-accent { color: #60a5fa; }
          .stat-card .value.hl-success { color: var(--success); }
          .stat-card .value.hl-danger { color: var(--danger); }
          .stat-card .value.hl-gold { color: var(--gold); }
          .stat-card .value.hl-purple { color: var(--purple); }
          
          /* Visual Retention Bank Balance */
          .bar-chart-container { margin-top: 15px; width: 100%; background: rgba(255,255,255,0.05); height: 10px; border-radius: 5px; overflow: hidden; }
          .bar-chart-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--purple)); border-radius: 5px; width: 0%; transition: 1s; }

          /* Tables styling */
          .card-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 25px; margin-bottom: 30px; overflow-x: auto; }
          .table-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .table-header h3 { font-size: 1.2rem; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { padding: 16px; border-bottom: 1px solid var(--border); font-size: 0.85rem; text-transform: uppercase; color: var(--text-dim); font-weight: 600; letter-spacing: 0.5px; }
          td { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.95rem; vertical-align: middle; }
          tr:hover td { background: rgba(255, 255, 255, 0.01); }

          /* Selection inputs in table */
          select.admin-select { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; color: var(--text); outline: none; font-size: 0.85rem; }

          .badge { font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; display: inline-block; }
          .badge-success { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
          .badge-pending { background: rgba(245, 158, 11, 0.15); color: var(--gold); border: 1px solid rgba(245, 158, 11, 0.3); }
          .badge-danger { background: rgba(239, 68, 68, 0.15); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
          .badge-purple { background: rgba(139, 92, 246, 0.15); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.3); }

          .btn-action { background: var(--accent); color: var(--text); border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: 0.2s; margin-right: 5px; }
          .btn-action:hover { background: #60a5fa; }
          .btn-action.btn-danger { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
          .btn-action.btn-danger:hover { background: var(--danger); color: var(--text); }
          .btn-action.btn-success { background: rgba(16, 185, 129, 0.2); color: #a7f3d0; border: 1px solid rgba(16, 185, 129, 0.4); }
          .btn-action.btn-success:hover { background: var(--success); color: var(--text); }

          /* Balance Edit Modal / Input */
          .balance-editor { display: flex; align-items: center; gap: 8px; }
          .balance-editor input { width: 90px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; color: var(--text); outline: none; }
          .btn-save-balance { background: var(--success); border: none; border-radius: 6px; padding: 6px 10px; color: var(--text); font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
          .btn-save-balance:hover { background: #059669; }

          /* Adjustments tab */
          .adjustments-form { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 30px; margin-bottom: 30px; }
          .adjustments-form h3 { font-size: 1.2rem; margin-bottom: 20px; font-weight: 600; }
          .btn-save-settings { background: var(--accent); border: none; border-radius: 10px; padding: 12px 24px; color: var(--text); font-weight: 600; cursor: pointer; transition: 0.2s; margin-top: 10px; }
          .btn-save-settings:hover { background: #60a5fa; }
          .settings-success-msg { color: var(--success); margin-top: 15px; font-weight: 600; font-size: 0.9rem; display: none; }

          /* Grid for configurations */
          .config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        </style>
      </head>
      <body>

        <!-- Login Container -->
        <div id="login-container">
          <div class="login-card">
            <h2>Painel Admin Pro</h2>
            <p>Gerenciamento & Controle de Retenção Block Win</p>
            <div class="form-group">
              <label for="admin-user">Usuário</label>
              <input type="text" id="admin-user" class="form-control" placeholder="Digite seu usuário">
            </div>
            <div class="form-group">
              <label for="admin-pass">Senha</label>
              <input type="password" id="admin-pass" class="form-control" placeholder="Digite sua senha">
            </div>
            <button class="btn-login" onclick="attemptLogin()">Entrar</button>
            <div id="login-error" class="error-msg">Usuário ou senha incorretos!</div>
          </div>
        </div>

        <!-- Dashboard Container -->
        <div id="dashboard-container">
          <header>
            <div class="header-brand">
              <h1>Block Win Pro</h1>
              <span class="badge-admin">CONTROLE DE RETENÇÃO & BANCA</span>
            </div>
            <button class="btn-logout" onclick="logoutAdmin()">Sair do Painel</button>
          </header>

          <div class="dashboard-main">
            <!-- Sidebar -->
            <div class="sidebar">
              <div class="nav-item active" onclick="switchTab('tab-geral', this)">Dashboard</div>
              <div class="nav-item" onclick="switchTab('tab-users', this)">Jogadores & RTP</div>
              <div class="nav-item" onclick="switchTab('tab-influencers', this)">Influenciadores</div>
              <div class="nav-item" onclick="switchTab('tab-cupons', this)">Cupons de Bônus</div>
              <div class="nav-item" onclick="switchTab('tab-txs', this)">Transações</div>
              <div class="nav-item" onclick="switchTab('tab-settings', this)">Ajustes de Retenção</div>
            </div>

            <!-- Content Area -->
            <div class="content-area">
              
              <!-- TAB: Geral -->
              <div id="tab-geral" class="tab-content active">
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="label">Jogadores Cadastrados</div>
                    <div id="stat-total-users" class="value hl-accent">0</div>
                  </div>
                  <div class="stat-card">
                    <div class="label">Banca Total (Saldos)</div>
                    <div id="stat-total-balance" class="value hl-purple">R$ 0,00</div>
                  </div>
                  <div class="stat-card">
                    <div class="label">Depósitos (Aprovados)</div>
                    <div id="stat-total-deposits" class="value hl-success">R$ 0,00</div>
                  </div>
                  <div class="stat-card">
                    <div class="label">Saques (Pagos)</div>
                    <div id="stat-total-withdrawals" class="value hl-danger">R$ 0,00</div>
                  </div>
                  <div class="stat-card">
                    <div class="label">Retenção da Banca</div>
                    <div id="stat-retention-rate" class="value hl-gold">0%</div>
                    <div class="bar-chart-container">
                      <div id="retention-bar" class="bar-chart-fill"></div>
                    </div>
                  </div>
                </div>

                <div class="card-table">
                  <div class="table-header">
                    <h3>Alertas Importantes</h3>
                  </div>
                  <div id="recent-activity-list" style="color: var(--text-dim); font-size: 0.95rem;">
                    Buscando notificações do banco de dados...
                  </div>
                </div>
              </div>

              <!-- TAB: Usuários & RTP per-user -->
              <div id="tab-users" class="tab-content">
                <div class="card-table">
                  <div class="table-header">
                    <h3>Gerenciamento de Jogadores & Controle de Dificuldade (RTP)</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Telefone</th>
                        <th>Saldo Principal</th>
                        <th>Partidas</th>
                        <th>Nível de Dificuldade</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody id="users-table-body">
                      <!-- Dynamically filled -->
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB: Influenciadores -->
              <div id="tab-influencers" class="tab-content">
                <div class="card-table">
                  <div class="table-header">
                    <h3>Influenciadores & Comissões de Afiliados</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Telefone</th>
                        <th>Papel</th>
                        <th>Convidados</th>
                        <th>Saldo Comissões</th>
                        <th>Taxa Comissão (%)</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody id="influencers-table-body">
                      <!-- Dynamically filled -->
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB: Cupons de Bônus -->
              <div id="tab-cupons" class="tab-content">
                <div class="config-grid">
                  <div class="adjustments-form" style="max-width: 100%;">
                    <h3>Criar Novo Cupom de Bônus</h3>
                    <div class="form-group">
                      <label for="coupon-code">Código do Cupom</label>
                      <input type="text" id="coupon-code" class="form-control" placeholder="Ex: BLOCK50">
                    </div>
                    <div class="form-group">
                      <label for="coupon-amount">Valor do Bônus (R$)</label>
                      <input type="number" id="coupon-amount" class="form-control" value="10" placeholder="Ex: 10">
                    </div>
                    <div class="form-group">
                      <label for="coupon-max-uses">Limite de Usos</label>
                      <input type="number" id="coupon-max-uses" class="form-control" value="100">
                    </div>
                    <button class="btn-save-settings" onclick="createNewCoupon()">Criar Cupom</button>
                    <div id="coupon-success" class="settings-success-msg">Cupom registrado com sucesso no Supabase!</div>
                  </div>
                  
                  <div class="card-table" style="margin-top: 0;">
                    <div class="table-header">
                      <h3>Cupons Ativos</h3>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Valor (R$)</th>
                          <th>Usos / Máximo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody id="coupons-table-body">
                        <!-- Dynamically filled -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- TAB: Transações -->
              <div id="tab-txs" class="tab-content">
                <div class="card-table">
                  <div class="table-header">
                    <h3>Aprovação de Depósitos e Saques</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>ID Transação</th>
                        <th>Telefone</th>
                        <th>Valor (R$)</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Criada em</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody id="txs-table-body">
                      <!-- Dynamically filled -->
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB: Ajustes de Retenção Globais -->
              <div id="tab-settings" class="tab-content">
                <div class="adjustments-form" style="max-width: 600px;">
                  <h3>Regras Globais de Payout & Retenção da Banca</h3>
                  
                  <div class="form-group">
                    <label for="settings-difficulty">Dificuldade Global Padrão</label>
                    <select id="settings-difficulty" class="form-control" style="background: rgba(15, 23, 42, 0.6); color: var(--text); border: 1px solid var(--border);">
                      <option value="EASY">FÁCIL (Peças pequenas, facilita vitórias)</option>
                      <option value="NORMAL">NORMAL (Aleatoriedade padrão)</option>
                      <option value="HARD">DIFÍCIL (Peças grandes, enche o tabuleiro)</option>
                      <option value="FORCE_LOSS">PERDA FORÇADA (Peças projetadas para não encaixar)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="settings-multiplier">Meta Multiplicadora de Cashout (ex: 2.0 para 2x)</label>
                    <input type="number" step="0.1" id="settings-multiplier" class="form-control" value="2.0">
                  </div>
                  
                  <div class="form-group">
                    <label for="settings-rate">Ganhos por Linha eliminada (ex: 10 para 10% da aposta)</label>
                    <input type="number" id="settings-rate" class="form-control" value="10">
                  </div>

                  <div class="form-group">
                    <label for="settings-presets">Presets de Apostas Rápidas (Separados por vírgula em R$)</label>
                    <input type="text" id="settings-presets" class="form-control" value="3, 5, 10, 20, 50, 100">
                  </div>

                  <button class="btn-save-settings" onclick="saveAdminSettings()">Salvar Configurações</button>
                  <div id="settings-success" class="settings-success-msg">Configurações globais salvas com sucesso!</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const script = document.createElement('script');
    script.textContent = `
      const SB_URL = "${SUPABASE_URL}";
      const SB_KEY = "${SUPABASE_KEY}";
      const SB_HEADERS = {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json'
      };

      if (sessionStorage.getItem('admin_authenticated') === 'true') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'flex';
        loadDashboardData();
      }

      window.attemptLogin = function() {
        const user = document.getElementById('admin-user').value;
        const pass = document.getElementById('admin-pass').value;
        
        if (user === 'LGN' && pass === '33172425sa') {
          document.getElementById('login-error').style.display = 'none';
          document.getElementById('login-container').style.display = 'none';
          document.getElementById('dashboard-container').style.display = 'flex';
          sessionStorage.setItem('admin_authenticated', 'true');
          loadDashboardData();
        } else {
          document.getElementById('login-error').style.display = 'block';
        }
      };

      window.logoutAdmin = function() {
        sessionStorage.removeItem('admin_authenticated');
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('dashboard-container').style.display = 'none';
      };

      window.switchTab = function(tabId, el) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
      };

      window.loadDashboardData = async function() {
        try {
          // 1. Get profiles
          const resProfiles = await fetch(SB_URL + '/rest/v1/profiles?order=created_at.desc', { headers: SB_HEADERS });
          const profiles = await resProfiles.json();

          // 2. Get transactions
          const resTxs = await fetch(SB_URL + '/rest/v1/transactions?order=created_at.desc', { headers: SB_HEADERS });
          const txs = await resTxs.json();

          // 3. Get coupons
          const resCoupons = await fetch(SB_URL + '/rest/v1/coupons?order=created_at.desc', { headers: SB_HEADERS });
          const coupons = await resCoupons.json();

          // 4. Get config settings
          const resConf = await fetch(SB_URL + '/rest/v1/config?key=eq.game_settings', { headers: SB_HEADERS });
          const confData = await resConf.json();
          let globalDiff = 'NORMAL';
          if (confData[0] && confData[0].value) {
            const val = typeof confData[0].value === 'string' ? JSON.parse(confData[0].value) : confData[0].value;
            document.getElementById('settings-multiplier').value = val.targetMultiplier || 2.0;
            document.getElementById('settings-rate').value = Math.round((val.ratePerLine || 0.1) * 100);
            document.getElementById('settings-presets').value = (val.entrada_valores || [3, 5, 10, 20, 50, 100]).join(', ');
            document.getElementById('settings-difficulty').value = val.globalDifficulty || 'NORMAL';
            globalDiff = val.globalDifficulty || 'NORMAL';
          }

          // Calculate bank balance stats
          let totalBalance = 0;
          let totalDeposits = 0;
          let totalWithdrawals = 0;

          profiles.forEach(p => {
            totalBalance += Number(p.balance_cents || 0);
          });

          txs.forEach(t => {
            if (t.status === 'COMPLETED') {
              if (t.type === 'DEPOSIT') {
                totalDeposits += Number(t.amount_cents || 0);
              } else if (t.type === 'WITHDRAW' || t.type === 'WITHDRAW_AFFILIATE') {
                totalWithdrawals += Number(t.amount_cents || 0);
              }
            }
          });

          // Calculate Retention Rate
          let retentionRate = 0;
          if (totalDeposits > 0) {
            retentionRate = Math.round(((totalDeposits - totalWithdrawals) / totalDeposits) * 100);
          }

          document.getElementById('stat-total-users').innerText = profiles.length;
          document.getElementById('stat-total-balance').innerText = 'R$ ' + (totalBalance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          document.getElementById('stat-total-deposits').innerText = 'R$ ' + (totalDeposits / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          document.getElementById('stat-total-withdrawals').innerText = 'R$ ' + (totalWithdrawals / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          document.getElementById('stat-retention-rate').innerText = retentionRate + '%';
          
          const fillWidth = Math.max(0, Math.min(100, retentionRate));
          document.getElementById('retention-bar').style.width = fillWidth + '%';

          // Render Players list with difficulty dropdowns
          const usersTbody = document.getElementById('users-table-body');
          usersTbody.innerHTML = '';
          profiles.forEach(p => {
            const tr = document.createElement('tr');
            const diff = p.difficulty_override || 'DEFAULT';
            
            tr.innerHTML = \`
              <td>\${p.name}</td>
              <td>\${p.phone}</td>
              <td style="font-weight: 600; color: var(--success);">R$ \${(p.balance_cents / 100).toFixed(2)}</td>
              <td>\${p.games_played}</td>
              <td>
                <select class="admin-select" id="diff-\${p.phone}" onchange="changePlayerDifficulty('\${p.phone}')">
                  <option value="DEFAULT" \${diff === 'DEFAULT' ? 'selected' : ''}>PADRÃO (\${globalDiff})</option>
                  <option value="EASY" \${diff === 'EASY' ? 'selected' : ''}>FÁCIL</option>
                  <option value="NORMAL" \${diff === 'NORMAL' ? 'selected' : ''}>NORMAL</option>
                  <option value="HARD" \${diff === 'HARD' ? 'selected' : ''}>DIFÍCIL</option>
                  <option value="FORCE_LOSS" \${diff === 'FORCE_LOSS' ? 'selected' : ''}>PERDA FORÇADA</option>
                </select>
              </td>
              <td>
                <div class="balance-editor">
                  <input type="number" id="inp-bal-\${p.phone}" value="\${(p.balance_cents / 100).toFixed(2)}" step="1">
                  <button class="btn-save-balance" onclick="updateUserBalance('\${p.phone}')">Salvar</button>
                </div>
              </td>
            \`;
            usersTbody.appendChild(tr);
          });

          // Render Influencers list
          const influencersTbody = document.getElementById('influencers-table-body');
          influencersTbody.innerHTML = '';
          profiles.forEach(p => {
            const tr = document.createElement('tr');
            const role = p.role || 'USER';
            const commRate = p.custom_commission_rate !== null ? Math.round(Number(p.custom_commission_rate) * 100) : 10;
            
            tr.innerHTML = \`
              <td>\${p.name}</td>
              <td>\${p.phone}</td>
              <td>
                <select class="admin-select" id="role-\${p.phone}" onchange="changePlayerRole('\${p.phone}')">
                  <option value="USER" \${role === 'USER' ? 'selected' : ''}>JOGADOR</option>
                  <option value="INFLUENCER" \${role === 'INFLUENCER' ? 'selected' : ''}>INFLUENCER</option>
                </select>
              </td>
              <td style="font-weight: 600;">\${p.indicados_count}</td>
              <td style="color: var(--gold);">R$ \${(p.comissao_saldo_cents / 100).toFixed(2)}</td>
              <td>
                <input type="number" class="admin-select" style="width: 70px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: #fff;" id="comm-rate-\${p.phone}" value="\${commRate}">
              </td>
              <td>
                <button class="btn-action" onclick="saveInfluencerConfig('\${p.phone}')">Salvar Config</button>
              </td>
            \`;
            influencersTbody.appendChild(tr);
          });

          // Render Active Coupons
          const couponsTbody = document.getElementById('coupons-table-body');
          couponsTbody.innerHTML = '';
          coupons.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = \`
              <td><span class="badge badge-purple">\${c.code}</span></td>
              <td style="font-weight:600; color:var(--success);">R$ \${(c.amount_cents / 100).toFixed(2)}</td>
              <td>\${c.uses_count} / \${c.max_uses}</td>
              <td>
                <button class="btn-action btn-danger" onclick="deleteCoupon('\${c.code}')">Excluir</button>
              </td>
            \`;
            couponsTbody.appendChild(tr);
          });

          // Render Transactions
          const txsTbody = document.getElementById('txs-table-body');
          txsTbody.innerHTML = '';
          txs.forEach(t => {
            const tr = document.createElement('tr');
            const valStr = (t.amount_cents / 100).toFixed(2);
            const badgeClass = t.status === 'COMPLETED' ? 'badge-success' : t.status === 'PENDING' ? 'badge-pending' : 'badge-danger';
            const createdStr = new Date(t.created_at).toLocaleString('pt-BR');
            
            let actionBtn = '-';
            if (t.status === 'PENDING') {
              actionBtn = \`
                <button class="btn-action btn-success" onclick="resolveTransaction('\${t.id}', 'COMPLETED', '\${t.phone}', \${t.amount_cents})">Aprovar</button>
                <button class="btn-action btn-danger" onclick="resolveTransaction('\${t.id}', 'REJECTED')">Recusar</button>
              \`;
            }

            tr.innerHTML = \`
              <td>\${t.id}</td>
              <td>\${t.phone}</td>
              <td>R$ \${valStr}</td>
              <td>\${t.type}</td>
              <td><span class="badge \${badgeClass}">\${t.status}</span></td>
              <td>\${createdStr}</td>
              <td>\${actionBtn}</td>
            \`;
            txsTbody.appendChild(tr);
          });

          const pendingCount = txs.filter(t => t.status === 'PENDING').length;
          document.getElementById('recent-activity-list').innerHTML = pendingCount > 0 
            ? \`<strong style="color: var(--gold);">Há \${pendingCount} solicitações financeiras pendentes aguardando sua revisão manual na aba Transações!</strong>\` 
            : "Tudo tranquilo. Sem pendências de saques ou depósitos no momento.";

        } catch (err) {
          console.error("Dashboard error:", err);
        }
      };

      window.changePlayerDifficulty = async function(phone) {
        const difficulty = document.getElementById('diff-' + phone).value;
        try {
          const res = await fetch(SB_URL + '/rest/v1/profiles?phone=eq.' + phone, {
            method: 'PATCH',
            headers: SB_HEADERS,
            body: JSON.stringify({ difficulty_override: difficulty })
          });
          if (res.ok) {
            alert("Dificuldade atualizada com sucesso no banco de dados!");
            loadDashboardData();
          }
        } catch (e) {
          alert("Erro de conexão.");
        }
      };

      window.changePlayerRole = async function(phone) {
        const role = document.getElementById('role-' + phone).value;
        try {
          await fetch(SB_URL + '/rest/v1/profiles?phone=eq.' + phone, {
            method: 'PATCH',
            headers: SB_HEADERS,
            body: JSON.stringify({ role: role })
          });
        } catch (e) {}
      };

      window.saveInfluencerConfig = async function(phone) {
        const ratePercent = parseFloat(document.getElementById('comm-rate-' + phone).value);
        if (isNaN(ratePercent)) return;
        
        try {
          const res = await fetch(SB_URL + '/rest/v1/profiles?phone=eq.' + phone, {
            method: 'PATCH',
            headers: SB_HEADERS,
            body: JSON.stringify({ custom_commission_rate: ratePercent / 100 })
          });
          if (res.ok) {
            alert("Configurações do influenciador atualizadas!");
            loadDashboardData();
          }
        } catch (e) {
          alert("Erro.");
        }
      };

      window.createNewCoupon = async function() {
        const code = document.getElementById('coupon-code').value.trim().toUpperCase();
        const amount = parseFloat(document.getElementById('coupon-amount').value);
        const maxUses = parseInt(document.getElementById('coupon-max-uses').value);

        if (!code || isNaN(amount) || isNaN(maxUses)) {
          alert("Preencha todos os dados do cupom.");
          return;
        }

        try {
          const res = await fetch(SB_URL + '/rest/v1/coupons', {
            method: 'POST',
            headers: SB_HEADERS,
            body: JSON.stringify({
              code: code,
              amount_cents: Math.round(amount * 100),
              max_uses: maxUses,
              uses_count: 0
            })
          });
          if (res.ok) {
            document.getElementById('coupon-code').value = '';
            const msg = document.getElementById('coupon-success');
            msg.style.display = 'block';
            setTimeout(() => msg.style.display = 'none', 3000);
            loadDashboardData();
          } else {
            alert("Esse cupom já existe ou ocorreu um erro.");
          }
        } catch (e) {
          alert("Erro de conexão.");
        }
      };

      window.deleteCoupon = async function(code) {
        if (!confirm("Tem certeza que deseja excluir o cupom " + code + "?")) return;
        try {
          const res = await fetch(SB_URL + '/rest/v1/coupons?code=eq.' + code, {
            method: 'DELETE',
            headers: SB_HEADERS
          });
          if (res.ok) {
            loadDashboardData();
          }
        } catch (e) {}
      };

      window.updateUserBalance = async function(phone) {
        const input = document.getElementById('inp-bal-' + phone);
        const val = parseFloat(input.value);
        if (isNaN(val)) return;

        try {
          const res = await fetch(SB_URL + '/rest/v1/profiles?phone=eq.' + phone, {
            method: 'PATCH',
            headers: SB_HEADERS,
            body: JSON.stringify({ balance_cents: Math.round(val * 100) })
          });
          if (res.ok) {
            alert("Saldo do jogador atualizado!");
            loadDashboardData();
          }
        } catch (e) {}
      };

      window.resolveTransaction = async function(id, status, phone = null, amountCents = 0) {
        try {
          const res = await fetch(SB_URL + '/rest/v1/transactions?id=eq.' + id, {
            method: 'PATCH',
            headers: SB_HEADERS,
            body: JSON.stringify({ status: status })
          });

          if (res.ok) {
            if (status === 'COMPLETED' && phone) {
              const resProfile = await fetch(SB_URL + '/rest/v1/profiles?phone=eq.' + phone, { headers: SB_HEADERS });
              const pData = await resProfile.json();
              const currentProfile = pData[0];
              if (currentProfile) {
                const newBal = Number(currentProfile.balance_cents) + Number(amountCents);
                await fetch(SB_URL + '/rest/v1/profiles?phone=eq.' + phone, {
                  method: 'PATCH',
                  headers: SB_HEADERS,
                  body: JSON.stringify({ balance_cents: newBal })
                });
              }
            }
            alert("Operação financeira resolvida como " + status + "!");
            loadDashboardData();
          }
        } catch (e) {}
      };

      window.saveAdminSettings = async function() {
        const difficulty = document.getElementById('settings-difficulty').value;
        const targetMultiplier = parseFloat(document.getElementById('settings-multiplier').value);
        const ratePerLinePercent = parseFloat(document.getElementById('settings-rate').value);
        const presetsStr = document.getElementById('settings-presets').value;

        const presetsArray = presetsStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

        if (isNaN(targetMultiplier) || isNaN(ratePerLinePercent) || presetsArray.length === 0) {
          alert("Revise as informações digitadas.");
          return;
        }

        const config = {
          targetMultiplier: targetMultiplier,
          ratePerLine: ratePerLinePercent / 100,
          minBetCents: Math.round(presetsArray[0] * 100),
          maxBetCents: Math.round(presetsArray[presetsArray.length - 1] * 100),
          entrada_valores: presetsArray,
          globalDifficulty: difficulty
        };

        try {
          const res = await fetch(SB_URL + '/rest/v1/config', {
            method: 'POST',
            headers: { ...SB_HEADERS, 'Prefer': 'resolution=merge' },
            body: JSON.stringify({
              key: 'game_settings',
              value: config
            })
          });
          if (res.ok) {
            const msg = document.getElementById('settings-success');
            msg.style.display = 'block';
            setTimeout(() => msg.style.display = 'none', 3000);
            loadDashboardData();
          }
        } catch (e) {
          alert("Erro ao salvar.");
        }
      };
    `;
    document.body.appendChild(script);
    return;
  }
})();
