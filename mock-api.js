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

  const EASY_TEMPLATES = [
    { cells: [[0, 0]], width: 1, height: 1 },
    { cells: [[0, 0], [0, 1]], width: 2, height: 1 },
    { cells: [[0, 0], [1, 0]], width: 1, height: 2 },
    { cells: [[0, 0], [0, 1], [0, 2]], width: 3, height: 1 },
    { cells: [[0, 0], [1, 0], [2, 0]], width: 1, height: 3 },
    { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
    { cells: [[0, 0], [1, 0], [1, 1]], width: 2, height: 2 },
    { cells: [[0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
    { cells: [[0, 0], [0, 1], [1, 0]], width: 2, height: 2 },
    { cells: [[0, 0], [0, 1], [1, 1]], width: 2, height: 2 }
  ];

  const HARD_TEMPLATES = [
    { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], width: 5, height: 1 },
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], width: 1, height: 5 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
    { cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
    { cells: [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]], width: 3, height: 3 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], width: 3, height: 3 },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], width: 3, height: 3 }
  ];

  // Ads Pixel Tracking Helper
  function trackEvent(name, data = {}) {
    try {
      if (window.fbq) {
        window.fbq('track', name, data);
      }
      if (window.Ttp && window.Ttp.track) {
        window.Ttp.track(name, data);
      }
    } catch (e) {}
  }

  // Load and Initialize Pixels dynamically on startup
  (async function initPixels() {
    try {
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/config?key=eq.ads_settings`, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data[0] && data[0].value) {
          const val = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
          const { metaPixelId, tiktokPixelId } = val;
          
          if (metaPixelId) {
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', metaPixelId);
            fbq('track', 'PageView');
            console.log(`[Pixels] Facebook Pixel ${metaPixelId} loaded.`);
          }
          
          if (tiktokPixelId) {
            !function(w,d,t){w.Ttp=w.Ttp||[];var tt=w.Ttp;tt.prepare=function(c,e){
            var t=d.createElement("script");t.type="text/javascript",t.async=!0,t.src=c;
            var n=d.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)};
            tt.prepare("https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid="+tiktokPixelId);
            tt.track=function(e,t){w.Ttp.push([e,t])};
            tt.track("PageView");
            }(window, document, 'script');
            console.log(`[Pixels] TikTok Pixel ${tiktokPixelId} loaded.`);
          }
        }
      }
    } catch(e) {}
  })();

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

  // Config Table helpers
  async function dbGetConfig(key, defaultVal) {
    try {
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/config?key=eq.${key}`, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data[0] && data[0].value) {
          return typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
        }
      }
    } catch(e) {}
    return defaultVal;
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

  // Check if piece can fit anywhere on board
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

  async function getPlayerRtp(phone) {
    if (!phone) return 70;
    try {
      const p = await dbGetProfile(phone);
      if (!p) return 70;
      if (p.rtp !== undefined && p.rtp !== null) {
        return Number(p.rtp);
      }
      const isInfluencer = Number(p.indicados_count) > 0 || Number(p.total_commission_cents) > 0;
      const config = await dbGetConfig('game_settings', { rtp_normal: 70, rtp_influencer: 95 });
      if (isInfluencer) {
        return config.rtp_influencer !== undefined ? Number(config.rtp_influencer) : 95;
      } else {
        return config.rtp_normal !== undefined ? Number(config.rtp_normal) : 70;
      }
    } catch (e) {
      return 70;
    }
  }

  async function generateTray(phone) {
    const rtp = await getPlayerRtp(phone);
    const tray = [];
    for (let i = 0; i < 3; i++) {
      const roll = Math.random() * 100;
      let template;
      if (roll < rtp) {
        template = EASY_TEMPLATES[Math.floor(Math.random() * EASY_TEMPLATES.length)];
      } else {
        template = HARD_TEMPLATES[Math.floor(Math.random() * HARD_TEMPLATES.length)];
      }
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

  async function approveDepositTransaction(tx) {
    const txs = await dbGetTransactions(tx.phone);
    const completedCount = txs.filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED').length;
    
    let bonusCents = 0;
    if (completedCount === 0) {
      const config = await dbGetConfig('game_settings', { firstDepositBonusPercent: 100 });
      const percent = Number(config.firstDepositBonusPercent) || 0;
      if (percent > 0) {
        bonusCents = Math.round(Number(tx.amount_cents) * (percent / 100));
        
        const bonusTxId = 'BN' + Math.random().toString(36).substring(2, 11).toUpperCase();
        await dbCreateTransaction({
          id: bonusTxId,
          phone: tx.phone,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount_cents: bonusCents,
          pix_key: 'BÔNUS_PRIMEIRO_DEPÓSITO',
          txid: bonusTxId
        });
      }
    }

    await dbUpdateTransaction(tx.id, { status: 'COMPLETED' });
    const profile = await dbGetProfile(tx.phone);
    if (profile) {
      const newBalance = Number(profile.balance_cents) + Number(tx.amount_cents) + bonusCents;
      await dbUpdateProfile(tx.phone, { balance_cents: newBalance });
      
      trackEvent('Purchase', { value: tx.amount_cents / 100, currency: 'BRL' });
      console.log(`[Supabase Mock API] Approved deposit ${tx.id}. Balance credited. (Bonus: R$ ${(bonusCents / 100).toFixed(2)})`);
    }
  }

  // Auto approve deposits in background (Supabase polling with direct Vizzion Pay API)
  setInterval(async () => {
    try {
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/transactions?type=eq.DEPOSIT&status=eq.PENDING`, { headers: supabaseHeaders });
      if (!res.ok) return;
      const pendingTxs = await res.json();

      for (const tx of pendingTxs) {
        const pixKey = tx.pix_key || '';
        const gatewayTxId = pixKey.startsWith('vizzionpay:') ? pixKey.split(':')[1] : '';

        if (gatewayTxId && gatewayTxId !== 'simulado') {
          try {
            const resGate = await dbGetConfig('gateway_settings');
            const pubKey = resGate.clientId || 'loughanpk2001_j0np7mhexk9ws65u';
            const secKey = resGate.clientSecret || '6700v7cpkqx7dgn474oi9bmh6mcqah5hikzms3tzzj5d5ij129pb2pqpyuo9wd2q';

            // Poll directly via Vizzion Pay URL to avoid netlify proxy issues
            const directUrl = `https://app.vizzionpay.com.br/api/v1/gateway/transactions?id=${gatewayTxId}`;
            const checkRes = await originalFetch(directUrl, {
              headers: {
                'x-public-key': pubKey,
                'x-secret-key': secKey
              }
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              const st = String(checkData.status || '').toUpperCase();
              if (st === 'PAID' || st === 'APPROVED' || st === 'COMPLETED' || st === 'SUCCESS' || st === 'RECEIVED' || checkData.payedAt || checkData.paidAt) {
                console.log(`[Supabase Mock API] Vizzion Pay transaction ${gatewayTxId} is PAID (${st})! Approving deposit...`);
                await approveDepositTransaction(tx);
              }
            }
          } catch (e) {
            console.error("[Vizzionpay API] Error polling status for transaction:", gatewayTxId, e);
          }
        }
      }
    } catch (e) {}
  }, 2500);

  let demoGameSession = null;

  // Network Fetch Interceptor
  window.fetch = async function(url, options = {}) {
    let urlString = typeof url === 'string' ? url : url.url;
    
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      const parsed = new URL(urlString);
      urlString = parsed.pathname;
    }

    if (!urlString.startsWith('/api/') || urlString.startsWith('/api/vizzionpay/')) {
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
          message: "Erro no banco de dados. Certifique-se de que executou o script SQL no painel do Supabase, desativou RLS para as tabelas profiles, transactions, games, history, config e liberou o acesso." 
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

        // Tracker Meta Ads/TikTok registration event
        trackEvent('CompleteRegistration');

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
      const config = await dbGetConfig('game_settings', {
        targetMultiplier: 2.0,
        ratePerLine: 0.10,
        minBetCents: 300,
        maxBetCents: 10000,
        entrada_valores: [3, 5, 10, 20, 50, 100]
      });
      const depositSettings = await dbGetConfig('deposit_settings', {
        values: [20, 30, 50, 100, 200],
        labels: { "20": "MÍNIMO", "30": "QUENTE", "50": "+CHANCES", "100": "BÔNUS", "200": "BÔNUS" },
        colors: { "20": "#f59e0b", "30": "#ef4444", "50": "#22c55e", "100": "#8b5cf6", "200": "#8b5cf6" }
      });
      return new Response(JSON.stringify({
        entrada_valores: config.entrada_valores || [3, 5, 10, 20, 50, 100],
        deposito_valores_rapidos: depositSettings.values,
        deposito_botoes_labels: depositSettings.labels,
        deposito_botoes_cores: depositSettings.colors,
        fin: {
          deposito_minimo: config.minDeposit !== undefined ? Number(config.minDeposit) : 20,
          deposito_maximo: 10000,
          saque_minimo: config.minWithdraw !== undefined ? Number(config.minWithdraw) : 30,
          saque_afiliado_minimo: config.minWithdraw !== undefined ? Number(config.minWithdraw) : 30
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Deposit info
    if (urlString === '/api/wallet/deposit-info' && method === 'GET') {
      const config = await dbGetConfig('game_settings', { firstDepositBonusPercent: 100 });
      const percent = config.firstDepositBonusPercent !== undefined ? Number(config.firstDepositBonusPercent) : 100;
      return new Response(JSON.stringify({
        elegivel: true, bonus_minimo: 20, bonus_maximo: 500, bonus_percentual: percent
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Route: Wallet details
    if (urlString === '/api/wallet/' && method === 'GET') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      try {
        const pendingTxs = await dbGetTransactions(user.phone);
        const resGate = await dbGetConfig('gateway_settings');
        for (const tx of pendingTxs) {
          if (tx.type === 'DEPOSIT' && tx.status === 'PENDING') {
            const pixKey = tx.pix_key || '';
            const gatewayTxId = pixKey.startsWith('vizzionpay:') ? pixKey.split(':')[1] : '';
            if (gatewayTxId && gatewayTxId !== 'simulado') {
              try {
                const checkRes = await originalFetch(`/api/vizzionpay/gateway/transactions?id=${gatewayTxId}`, {
                  headers: {
                    'x-public-key': resGate.clientId || 'loughanpk2001_j0np7mhexk9ws65u',
                    'x-secret-key': resGate.clientSecret || '6700v7cpkqx7dgn474oi9bmh6mcqah5hikzms3tzzj5d5ij129pb2pqpyuo9wd2q'
                  }
                });
                if (checkRes.ok) {
                  const checkData = await checkRes.json();
                  const st = String(checkData.status || '').toUpperCase();
                  if (st === 'PAID' || st === 'APPROVED' || st === 'COMPLETED' || st === 'SUCCESS' || st === 'RECEIVED' || checkData.payedAt || checkData.paidAt) {
                    console.log(`[Supabase Mock API] Instant check: Vizzion Pay transaction ${gatewayTxId} is PAID (${st})! Approving...`);
                    await approveDepositTransaction(tx);
                  }
                }
              } catch (e) {}
            }
          }
        }
        const updatedUser = await dbGetProfile(user.phone) || user;
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
      
      const config = await dbGetConfig('game_settings', { minDeposit: 20 });
      const minDepCents = config.minDeposit !== undefined ? Number(config.minDeposit) * 100 : 2000;
      
      if (!amountCents || amountCents < minDepCents) {
        return new Response(JSON.stringify({ message: "Valor mínimo de R$ " + (minDepCents / 100).toFixed(2) }), { status: 400 });
      }

      const txid = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
      let pixCode = '';
      let qrcode = '';
      let gatewayTxId = '';

      const resGate = await dbGetConfig('gateway_settings', { gatewayName: 'vizzionpay' });
      try {
        const vizzionRes = await originalFetch('/api/vizzionpay/gateway/pix/receive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': resGate.clientId || 'loughanpk2001_j0np7mhexk9ws65u',
            'x-secret-key': resGate.clientSecret || '6700v7cpkqx7dgn474oi9bmh6mcqah5hikzms3tzzj5d5ij129pb2pqpyuo9wd2q'
          },
          body: JSON.stringify({
            identifier: txid,
            amount: amountCents / 100,
            client: {
              name: user.name || "Jogador BlockCash",
              email: user.email || (user.phone + "@blockcash.com"),
              phone: user.phone,
              document: user.cpf || "12345678909"
            },
            callbackUrl: window.location.origin + '/api/webhook/vizzionpay'
          })
        });
        
        if (vizzionRes.ok) {
          const vizzionData = await vizzionRes.json();
          if (vizzionData.pix && vizzionData.pix.code) {
            pixCode = vizzionData.pix.code;
            qrcode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
            gatewayTxId = vizzionData.transactionId;
          } else {
            return new Response(JSON.stringify({ message: "A gateway Vizzion Pay não retornou os dados do Pix." }), { status: 400 });
          }
        } else {
          const errText = await vizzionRes.text();
          console.error("[Vizzionpay API] Error:", errText);
          return new Response(JSON.stringify({ message: "Erro na Gateway Vizzion Pay: " + errText }), { status: 400 });
        }
      } catch (e) {
        console.error("[Vizzionpay API] Failed:", e);
        return new Response(JSON.stringify({ message: "Falha de conexão com a gateway de pagamento Vizzion Pay." }), { status: 500 });
      }

      const newTx = {
        id: txid,
        phone: user.phone,
        type: 'DEPOSIT',
        status: 'PENDING',
        amount_cents: amountCents,
        pix_code: pixCode,
        qrcode: qrcode,
        txid: txid,
        pix_key: 'vizzionpay:' + gatewayTxId
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

    // Route: Withdraw balance (MANUAL APPROVAL)
    if (urlString === '/api/wallet/withdraw' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { amountCents, pixKey, typePix } = body;
      
      const config = await dbGetConfig('game_settings', { minWithdraw: 30 });
      const minWithCents = config.minWithdraw !== undefined ? Number(config.minWithdraw) * 100 : 3000;
      
      if (!amountCents || amountCents < minWithCents) {
        return new Response(JSON.stringify({ message: "Saque mínimo de R$ " + (minWithCents / 100).toFixed(2) }), { status: 400 });
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
          status: 'PENDING',
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

    // Route: Withdraw affiliate commission (MANUAL APPROVAL)
    if (urlString === '/api/wallet/withdraw-affiliate' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { amountCents, pixKey, typePix } = body;
      
      const config = await dbGetConfig('game_settings', { minWithdraw: 30 });
      const minWithCents = config.minWithdraw !== undefined ? Number(config.minWithdraw) * 100 : 3000;
      
      if (!amountCents || amountCents < minWithCents) {
        return new Response(JSON.stringify({ message: "Saque mínimo de R$ " + (minWithCents / 100).toFixed(2) }), { status: 400 });
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
          status: 'PENDING',
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

    // Route: Coupon redeem (Dynamic Coupon validation)
    if (urlString === '/api/cupons/resgatar' && method === 'POST') {
      if (!user) return new Response(JSON.stringify({ message: "Não autorizado" }), { status: 401 });
      const { codigo } = body;
      const codeUpper = (codigo || '').trim().toUpperCase();

      try {
        const activeCoupons = await dbGetConfig('coupons', [
          { code: 'BLOCK10', amountCents: 1000, type: 'FIXED' },
          { code: 'GANHE20', amountCents: 2000, type: 'FIXED' }
        ]);

        const matchedCoupon = activeCoupons.find(c => c.code.trim().toUpperCase() === codeUpper);
        if (!matchedCoupon) {
          return new Response(JSON.stringify({ message: "Cupom inválido ou expirado." }), { status: 400 });
        }

        const txs = await dbGetTransactions(user.phone);
        const alreadyRedeemed = txs.some(t => t.type === 'DEPOSIT' && t.pix_key === `CUPOM:${codeUpper}`);
        if (alreadyRedeemed) {
          return new Response(JSON.stringify({ message: "Cupom já resgatado por você." }), { status: 400 });
        }

        // Bônus Fixo coupon
        const rewardCents = matchedCoupon.amountCents || 1000;
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
      const config = await dbGetConfig('game_settings', {
        targetMultiplier: 2.0,
        ratePerLine: 0.10,
        minBetCents: 300,
        maxBetCents: 10000,
        entrada_valores: [3, 5, 10, 20, 50, 100]
      });
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
      if (!user) {
        return new Response(JSON.stringify({ session: demoGameSession || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
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
      if (!user) {
        const betCents = (body && body.betCents) ? body.betCents : 1000;
        demoGameSession = {
          id: 'DEMO_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
          phone: 'demo',
          status: 'ACTIVE',
          isDemo: true,
          bet_cents: betCents,
          accumulated_cents: 0,
          target_cents: Math.round(betCents * 2.0),
          target_multiplier: 2.0,
          board: Array(8).fill(0).map(() => Array(8).fill(0)),
          tray: await generateTray('demo')
        };
        const mappedDemo = {
          id: demoGameSession.id,
          phone: demoGameSession.phone,
          status: demoGameSession.status,
          betCents: demoGameSession.bet_cents,
          accumulatedCents: demoGameSession.accumulated_cents,
          targetCents: demoGameSession.target_cents,
          targetMultiplier: demoGameSession.target_multiplier,
          board: demoGameSession.board,
          tray: demoGameSession.tray
        };
        return new Response(JSON.stringify({ session: mappedDemo }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      const { betCents } = body;
      if (!betCents || betCents < 100) {
        return new Response(JSON.stringify({ message: "Aposta mínima de R$ 1,00" }), { status: 400 });
      }

      if (Number(user.balance_cents) < betCents) {
        return new Response(JSON.stringify({ message: "Saldo insuficiente. Faça um depósito no painel." }), { status: 400 });
      }

      try {
        const config = await dbGetConfig('game_settings', { targetMultiplier: 2.0 });
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
        
        const newGame = {
          id: gameId,
          phone: user.phone,
          status: 'ACTIVE',
          bet_cents: betCents,
          accumulated_cents: 0,
          target_cents: Math.round(betCents * targetMultiplier),
          target_multiplier: targetMultiplier,
          board: Array(8).fill(0).map(() => Array(8).fill(0)),
          tray: await generateTray(user.phone)
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

        // Trigger Meta/TikTok Ads event (InitiateCheckout)
        trackEvent('InitiateCheckout', { value: betCents / 100, currency: 'BRL' });

        return new Response(JSON.stringify({ session: mappedGame }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return handleSchemaError(err);
      }
    }

    // Route: Placed a piece move
    if (urlString.startsWith('/api/game/') && urlString.endsWith('/move') && method === 'POST') {
      const parts = urlString.split('/');
      const gameId = parts[3];

      if (!user || gameId.startsWith('DEMO_')) {
        if (!demoGameSession || demoGameSession.id !== gameId) {
          return new Response(JSON.stringify({ message: "Partida inválida." }), { status: 400 });
        }

        const rate = 0.50; // Demo mode: 50% reward rate per line (higher payout than normal)
        const { pieceIndex, row, col } = body;
        const piece = demoGameSession.tray[pieceIndex];
        if (!piece || !piece.available) {
          return new Response(JSON.stringify({ message: "Peça indisponível." }), { status: 400 });
        }

        if (!canPlacePiece(demoGameSession.board, piece.cells, row, col)) {
          return new Response(JSON.stringify({ message: "Posição inválida." }), { status: 400 });
        }

        demoGameSession.board = applyPiece(demoGameSession.board, piece.cells, row, col, piece.colorId);
        piece.available = false;

        const cleared = getClearedLines(demoGameSession.board);
        const clearedCount = cleared.rows.length + cleared.cols.length;
        let gainedCents = 0;

        if (clearedCount > 0) {
          gainedCents = Math.round(demoGameSession.bet_cents * rate * clearedCount);
          demoGameSession.accumulated_cents += gainedCents;

          for (const r of cleared.rows) {
            for (let c = 0; c < 8; c++) demoGameSession.board[r][c] = 0;
          }
          for (const c of cleared.cols) {
            for (let r = 0; r < 8; r++) demoGameSession.board[r][c] = 0;
          }
        }

        const allUsed = demoGameSession.tray.every(p => !p.available);
        if (allUsed) {
          demoGameSession.tray = await generateTray('demo');
        }

        let gameOver = true;
        for (const p of demoGameSession.tray) {
          if (p.available && pieceCanFitAnywhere(demoGameSession.board, p.cells, p.width, p.height)) {
            gameOver = false;
            break;
          }
        }

        if (gameOver) {
          demoGameSession.status = 'LOST';
        }

        const mappedGame = {
          id: demoGameSession.id,
          phone: demoGameSession.phone,
          status: demoGameSession.status,
          betCents: demoGameSession.bet_cents,
          accumulatedCents: demoGameSession.accumulated_cents,
          targetCents: demoGameSession.target_cents,
          targetMultiplier: demoGameSession.target_multiplier,
          board: demoGameSession.board,
          tray: demoGameSession.tray
        };

        return new Response(JSON.stringify({
          clearedRows: cleared.rows,
          clearedCols: cleared.cols,
          gainedCents: gainedCents,
          gameOver: gameOver,
          session: mappedGame
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      try {
        const game = await dbGetActiveGame(user.phone);
        if (!game || game.id !== gameId) {
          return new Response(JSON.stringify({ message: "Partida inválida." }), { status: 400 });
        }

        const config = await dbGetConfig('game_settings', { ratePerLine: 0.10 });
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

        const allUsed = game.tray.every(p => !p.available);
        if (allUsed) {
          game.tray = await generateTray(user.phone);
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
      const parts = urlString.split('/');
      const gameId = parts[3];

      if (!user || gameId.startsWith('DEMO_')) {
        if (!demoGameSession || demoGameSession.id !== gameId) {
          return new Response(JSON.stringify({ message: "Partida inválida." }), { status: 400 });
        }

        demoGameSession.status = 'WON';
        const payoutCents = demoGameSession.accumulated_cents;
        const mappedGame = {
          id: demoGameSession.id,
          phone: demoGameSession.phone,
          status: 'WON',
          betCents: demoGameSession.bet_cents,
          accumulatedCents: demoGameSession.accumulated_cents,
          targetCents: demoGameSession.target_cents,
          targetMultiplier: demoGameSession.target_multiplier,
          board: demoGameSession.board,
          tray: demoGameSession.tray
        };

        demoGameSession = null;
        return new Response(JSON.stringify({ session: mappedGame, payoutCents: payoutCents }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

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
      if (!user) {
        demoGameSession = null;
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
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
