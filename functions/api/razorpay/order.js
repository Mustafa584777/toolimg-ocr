export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Guest-ID, Authorization, *',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { amount, currency = 'INR', receipt } = body;

    if (!amount) {
      return new Response(JSON.stringify({ error: 'Amount is required' }), { status: 400, headers: corsHeaders });
    }

    let amountInPaise = Number(amount);
    
    // Convert INR to Paise if called by old frontend endpoint /api/razorpay/order
    if (amountInPaise < 100) {
      amountInPaise = Math.round(amountInPaise * 100);
    }

    if (amountInPaise < 100) {
      return new Response(JSON.stringify({ error: 'Minimum amount must be at least 100 paise (₹1)' }), { status: 400, headers: corsHeaders });
    }

    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay keys are missing. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Pages dashboard.' }), { status: 500, headers: corsHeaders });
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency,
        receipt: receipt || 'rcpt_' + Math.random().toString(36).substring(2, 15)
      })
    });

    if (!rzpResponse.ok) {
      const errText = await rzpResponse.text();
      return new Response(JSON.stringify({ error: `Razorpay API Error: ${errText}` }), { status: rzpResponse.status, headers: corsHeaders });
    }

    const order = await rzpResponse.json();
    return new Response(JSON.stringify({
      orderId: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Razorpay Create Order error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Serverless Function execution error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Guest-ID, Authorization, *'
    }
  });
}
