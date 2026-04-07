"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const createPaymentSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  message: z.string().min(5),
  price: z.number().min(1500),
  creatorId: z.string(),
});

type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;

export async function createPayment(data: CreatePaymentSchema) {
  const schema = createPaymentSchema.safeParse(data);

  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    };
  }

  try {
    const creator = await prisma.user.findFirst({
      where: {
        connectedStripeAccountId: data.creatorId,
      },
    });

    if (!creator) {
      return {
        error: "Falha ao criar o pagamento, tente mais tarde.",
      };
    }

    const applicationFeeAmount = Math.floor(data.price * 0.1);

    const donation = await prisma.donation.create({
      data: {
        donorName: data.name,
        donorMessage: data.message,
        userId: creator.id,
        status: "PENDING",
        amount: data.price - applicationFeeAmount,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      success_url: `${process.env.HOST_URL}/creator/${data.slug}`,
      cancel_url: `${process.env.HOST_URL}/creator/${data.slug}`,

      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Apoiar " + creator.name,
            },
            unit_amount: data.price,
          },
          quantity: 1,
        },
      ],

      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: creator.connectedStripeAccountId!,
        },
        metadata: {
          donationId: donation.id,
          donorName: data.name,
          donorMessage: data.message,
        },
      },
    });

    if (!session.url) {
      return {
        error: "Falha ao criar o pagamento.",
      };
    }

    return {
      url: session.url,
    };
  } catch (err) {
    return {
      error: "Falha ao criar o pagamento, tente mais tarde.",
    };
  }
}
