const SUPABASE_URL = "https://knnartlkluqscwlirybv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubmFydGxrbHVxc2N3bGlyeWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjAzODgsImV4cCI6MjEwMDE5NjM4OH0.JbdzBgxZPWnhv3SttMd5RBcocPMxFmPb6nSCuJ_JCQA";

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

exports.handler = async function(event, context) {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true, note: "Method not POST" })
    };
  }

  try {
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: true, note: "Invalid JSON" })
      };
    }

    const eventName = body.event;
    const txData = body.transaction || {};
    const clientData = body.client || {};

    // 1. Validação: Verifique se event === "TRANSACTION_PAID" e status === "COMPLETED"
    if (eventName !== 'TRANSACTION_PAID' || txData.status !== 'COMPLETED') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: true, ignored: true })
      };
    }

    const gatewayTxId = txData.id;
    const amount = Number(txData.amount || 0);
    const amountCents = Math.round(amount * 100);

    if (!gatewayTxId || amountCents <= 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: true, note: "Invalid transaction data" })
      };
    }

    // 2. Prevenção de Duplicidade (Idempotência)
    // Verifica se essa transação já foi processada
    const checkTxRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?pix_key=like.*${gatewayTxId}*&status=eq.COMPLETED`, { headers });
    if (checkTxRes.ok) {
      const existingTxs = await checkTxRes.json();
      if (existingTxs && existingTxs.length > 0) {
        console.log(`[Webhook Vizzionpay] Transação ${gatewayTxId} já processada anteriormente (Idempotente).`);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ received: true, duplicated: true })
        };
      }
    }

    // Também verifica por ID direto
    const checkIdRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${gatewayTxId}&status=eq.COMPLETED`, { headers });
    if (checkIdRes.ok) {
      const existingIdTxs = await checkIdRes.json();
      if (existingIdTxs && existingIdTxs.length > 0) {
        console.log(`[Webhook Vizzionpay] Transação ${gatewayTxId} por ID já processada.`);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ received: true, duplicated: true })
        };
      }
    }

    // 3. Identificação do Usuário
    const clientEmail = clientData.email || '';
    let phone = '';

    if (clientEmail.includes('@blockcash.com')) {
      phone = clientEmail.split('@')[0].trim();
    }

    let profile = null;
    if (phone) {
      const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?phone=eq.${phone}`, { headers });
      if (profRes.ok) {
        const profs = await profRes.json();
        if (profs && profs.length > 0) profile = profs[0];
      }
    }

    if (!profile && clientEmail) {
      const profEmailRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(clientEmail)}`, { headers });
      if (profEmailRes.ok) {
        const profsEmail = await profEmailRes.json();
        if (profsEmail && profsEmail.length > 0) profile = profsEmail[0];
      }
    }

    // Se não encontrou por e-mail ou telefone formatado, busca em transações pendentes o pix_key com gatewayTxId
    if (!profile) {
      const pendTxRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?pix_key=like.*${gatewayTxId}*`, { headers });
      if (pendTxRes.ok) {
        const pendTxs = await pendTxRes.json();
        if (pendTxs && pendTxs.length > 0) {
          phone = pendTxs[0].phone;
          const profPhoneRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?phone=eq.${phone}`, { headers });
          if (profPhoneRes.ok) {
            const profsPhone = await profPhoneRes.json();
            if (profsPhone && profsPhone.length > 0) profile = profsPhone[0];
          }
        }
      }
    }

    if (!profile) {
      console.error(`[Webhook Vizzionpay] Usuário não encontrado para o e-mail: ${clientEmail} ou transactionId: ${gatewayTxId}`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: true, userNotFound: true })
      };
    }

    phone = profile.phone;

    // 4. Atualização de Saldo & Bônus de Primeiro Depósito
    const userTxsRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?phone=eq.${phone}&type=eq.DEPOSIT&status=eq.COMPLETED`, { headers });
    let completedDepositsCount = 0;
    if (userTxsRes.ok) {
      const userTxs = await userTxsRes.json();
      completedDepositsCount = userTxs.length;
    }

    let bonusCents = 0;
    if (completedDepositsCount === 0) {
      bonusCents = amountCents; // 100% de bônus no primeiro depósito
      const bonusTxId = 'BN' + Math.random().toString(36).substring(2, 11).toUpperCase();
      await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: bonusTxId,
          phone: phone,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount_cents: bonusCents,
          pix_key: 'BÔNUS_PRIMEIRO_DEPÓSITO',
          txid: bonusTxId
        })
      });
    }

    // Atualiza a transação pendente existente ou cria uma nova com status COMPLETED
    const pendCheck = await fetch(`${SUPABASE_URL}/rest/v1/transactions?pix_key=like.*${gatewayTxId}*`, { headers });
    if (pendCheck.ok) {
      const pendTxs = await pendCheck.json();
      if (pendTxs && pendTxs.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${pendTxs[0].id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'COMPLETED' })
        });
      } else {
        const newTxId = 'TX' + Math.random().toString(36).substring(2, 11).toUpperCase();
        await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: newTxId,
            phone: phone,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount_cents: amountCents,
            pix_key: 'vizzionpay:' + gatewayTxId,
            txid: newTxId
          })
        });
      }
    }

    // Adiciona o saldo à conta do jogador
    const currentBalanceCents = Number(profile.balance_cents || 0);
    const newBalanceCents = currentBalanceCents + amountCents + bonusCents;

    await fetch(`${SUPABASE_URL}/rest/v1/profiles?phone=eq.${phone}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ balance_cents: newBalanceCents })
    });

    console.log(`[Webhook Vizzionpay] Sucesso! Depósito creditado para ${phone}: R$ ${amount.toFixed(2)} + Bônus R$ ${(bonusCents/100).toFixed(2)}. Novo Saldo: R$ ${(newBalanceCents/100).toFixed(2)}`);

    // 5. Resposta de Sucesso
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true })
    };

  } catch (err) {
    console.error('[Webhook Vizzionpay] Erro interno:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Erro interno no servidor' })
    };
  }
};
