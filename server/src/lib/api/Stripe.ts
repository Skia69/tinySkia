import stripe from 'stripe';

const client = new stripe(`${process.env.S_SECRET_KEY}`, { apiVersion: '2020-03-02' });

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      /* eslint-disable @typescript-eslint/camelcase */
      grant_type: 'authorization_code',
      code,
      /* eslint-enable @typescript-eslint/camelcase */
    });
    // this will contain stripe_user_id, the access_token, scope, livemode, token_type, etc.
    return response;
  },
  charge: async (amount: number, source: string, stripeAccount: string) => {
    /* eslint-disable @typescript-eslint/camelcase */
    const res = await client.charges.create(
      {
        amount,
        currency: 'usd',
        source, // ID of a Credit Card, Debit Card, Bank information, etc.
        application_fee_amount: Math.round(amount * 0.05),
      },
      {
        stripe_account: stripeAccount,
      },
    );
    /* eslint-enable @typescript-eslint/camelcase */

    if (res.status !== 'succeeded') {
      throw new Error('failed to create charge with Stripe');
    }
  },
};
