async function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const data = encoder.encode(orderId + '|' + paymentId);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
    
    // Convert signatureBuffer to hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex === signature;
  } catch (err) {
    console.error('Error verifying signature:', err);
    return false;
  }
}

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing payment details for verification' }), { status: 400, headers: corsHeaders });
    }

    const secret = env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Razorpay secret key is not configured.' }), { status: 500, headers: corsHeaders });
    }

    const verified = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, secret);
    if (verified) {
      return new Response(JSON.stringify({ success: true, message: 'Payment verified successfully' }), { status: 200, headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid payment signature. Verification failed.' }), { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Razorpay Signature Verification Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Verification system error' }), {
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
