const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
admin.initializeApp();

const stripe = require('stripe')(functions.config().stripe.secret);

exports.createPaymentIntent = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        if (request.method === 'POST') {
            // Assuming amount is passed in the request body and is in fils (as Stripe expects the smallest currency unit)
            const amount = request.body.amount;

            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount,
                    currency: 'aed', // Set the currency to AED
                    payment_method_types: ['card'],
                });
                response.status(200).send(paymentIntent);
            } catch (error) {
                console.error(error);
                response.status(500).send(error);
            }
        } else {
            response.status(405).send('Method Not Allowed');
        }
    });
});
