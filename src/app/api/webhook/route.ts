import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const quoteId = session.metadata?.quoteId;
    const docType = session.metadata?.documentType;

    if (quoteId) {
      try {
        if (docType === 'PURCHASE ORDER') {
          // Update Purchase Order status in DB
          await prisma.purchaseOrder.update({
            where: { poNumber: quoteId },
            data: { status: 'Received' },
          });
          console.log(`Purchase Order ${quoteId} updated to Received via webhook`);
        } else {
          // Update order status in DB
          await prisma.order.update({
            where: { id: quoteId },
            data: { status: 'Paid' },
          });
          console.log(`Order ${quoteId} updated to Paid via webhook`);
        }
      } catch (dbErr) {
        console.error('Database update failed:', dbErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
