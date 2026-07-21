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
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/transactions?phone=eq.${phone}&order=created_at.desc`, { headers: supabaseHeaders });
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
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/history?phone=eq.${phone}&order=created_at.desc`, { headers: supabaseHeaders });
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
          // 1. Mark transaction as completed
          await dbUpdateTransaction(tx.id, { status: 'COMPLETED' });
          // 2. Fetch profile to get current balance
          const profile = await dbGetProfile(tx.phone);
          if (profile) {
            // 3. Update profile balance
            const newBalance = Number(profile.balance_cents) + Number(tx.amount_cents);
            await dbUpdateProfile(tx.phone, { balance_cents: newBalance });
            console.log(`[Supabase Mock API] Credited R$ ${(tx.amount_cents / 100).toFixed(2)} to ${tx.phone}`);
          }
        }
      }
    } catch (e) {
      // ignore
    }
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

    // Helper error responses if Supabase schema fails
    function handleSchemaError(err) {
      console.error(err);
      return new Response(JSON.stringify({ 
        error: { 
          message: "Erro no banco de dados. Certifique-se de que executou o script SQL no painel do Supabase." 
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
          referred_by: null
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
      return new Response(JSON.stringify({
        entrada_valores: [3, 5, 10, 20, 50, 100],
        deposito_valores_rapidos: [20, 30, 50, 100, 200],
        deposito_botoes_labels: { "20": "MÍNIMO", "30": "QUENTE", "50": "+CHANCES", "100": "BÔNUS", "200": "BÔNUS" },
        deposito_botoes_cores: { "20": "#f59e0b", "30": "#ef4444", "50": "#22c55e", "100": "#8b5cf6", "200": "#8b5cf6" },
        fin: { deposito_minimo: 20, deposito_maximo: 10000, saque_minimo: 30, saque_afiliado_minimo: 30 }
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
        return new Response(JSON.stringify({ message: "Saldo de comissões insuficiente." }), { status: 400 });
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

    // Route: Coupon redeem
    if (urlString === '/api/cupons/resgatar' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { codigo } = body;
      const codeUpper = (codigo || '').trim().toUpperCase();
      if (codeUpper !== 'BLOCK10' && codeUpper !== 'GANHE20') {
        return new Response(JSON.stringify({ message: "Cupom inválido ou expirado." }), { status: 400 });
      }

      try {
        const txs = await dbGetTransactions(user.phone);
        const alreadyRedeemed = txs.some(t => t.type === 'DEPOSIT' && t.pix_key === `CUPOM:${codeUpper}`);
        if (alreadyRedeemed) {
          return new Response(JSON.stringify({ message: "Cupom já resgatado por você." }), { status: 400 });
        }

        const rewardCents = codeUpper === 'BLOCK10' ? 1000 : 2000;
        const newBalance = Number(user.balance_cents) + rewardCents;
        
        await dbUpdateProfile(user.phone, { balance_cents: newBalance });

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
      return new Response(JSON.stringify({
        refCode: user.referral_code,
        link: `${window.location.origin}/cadastro?ref=${user.referral_code}`,
        commissionRate: 0.10,
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

        return new Response(JSON.stringify({
          codigo: user.referral_code,
          link: `${window.location.origin}/cadastro?ref=${user.referral_code}`,
          comissao_nivel1_perc: 10,
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
      return new Response(JSON.stringify({
        targetMultiplier: 2.0,
        ratePerLine: 0.10,
        minBetCents: 300,
        maxBetCents: 10000,
        entrada_valores: [3, 5, 10, 20, 50, 100]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Active Game session
    if (urlString === '/api/game/active' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      try {
        const activeGame = await dbGetActiveGame(user.phone);
        if (activeGame) {
          // Parse json properties
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
        // Forfeit previous active game
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

        // Deduct bet from profile
        const newBalance = Number(user.balance_cents) - betCents;
        await dbUpdateProfile(user.phone, { balance_cents: newBalance });

        const gameId = 'G' + Math.random().toString(36).substring(2, 11).toUpperCase();
        const targetMultiplier = 2.0;
        
        const newGame = {
          id: gameId,
          phone: user.phone,
          status: 'ACTIVE',
          bet_cents: betCents,
          accumulated_cents: 0,
          target_cents: Math.round(betCents * targetMultiplier),
          target_multiplier: targetMultiplier,
          board: Array(8).fill(0).map(() => Array(8).fill(0)),
          tray: generateTray()
        };

        await dbCreateGame(newGame);

        // Map database object keys to fit client expectations
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

        // Parse db values
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

        // Apply piece
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

        // Close game session
        await dbUpdateGame(game.id, { status: 'CASHED_OUT' });

        // Update profile
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

        // Referral commission logic (10% to inviter)
        if (user.referred_by) {
          const referrer = await dbGetProfile(user.referred_by);
          if (referrer) {
            const commission = Math.round(game.betCents * 0.10);
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
})();
