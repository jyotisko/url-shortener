import axios from 'axios';

const stripe = Stripe('pk_test_51J3gXCSEvfkMrwjt98LFA4JzKhjWgfXtcHip50PQjiQDZWLyZIv7dqwXK1evEKvJ9tsmBDZ7eFSlTUEwthBz7CiU00cLOWyvDN');

export const donate = async amount => {
  try {
    const session = await axios({
      method: 'GET',
      url: `/api/v1/donations/checkout-session/${amount}`
    });

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

  } catch (err) {
    throw err;
  }
};