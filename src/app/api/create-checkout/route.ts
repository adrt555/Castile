import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { quoteId, displayId, amount, clientName, documentType } = await req.json();

    if (!quoteId || !amount) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const isPO = documentType === 'PURCHASE ORDER';
    const redirectBase = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const successUrl = isPO 
      ? `${redirectBase}/invoice/${quoteId}?success=true&session_id={CHECKOUT_SESSION_ID}&type=po`
      : `${redirectBase}/invoice/${quoteId}?success=true&session_id={CHECKOUT_SESSION_ID}`;
      
    const cancelUrl = isPO
      ? `${redirectBase}/admin/purchase-orders?canceled=true`
      : `${redirectBase}/admin/orders/${quoteId}?canceled=true`;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isPO ? `Payment for Purchase Order #${displayId || quoteId}` : `Payment for Quote #${displayId || quoteId}`,
              description: clientName ? `${isPO ? 'Manufacturer/Client' : 'Client'}: ${clientName}` : undefined,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      invoice_creation: {
        enabled: true,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        quoteId: quoteId,
        documentType: documentType || 'ORDER',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
