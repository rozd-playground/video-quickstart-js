'use strict';

const functions = require('firebase-functions');
const cors = require('cors')({
    origin: true,
});
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const randomName = require('./randomname');

const MAX_ALLOWED_SESSION_DURATION = 14400;

exports.token = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
        res.status(403).send('Forbidden!');
        return;
    }

    cors(req, res, () => {
        const identity = req.query.identity || randomName();
        const config = functions.config();

        // Create an access token which we will sign and return to the client,
        // containing the grant we just created.
        const token = new AccessToken(
            config.twilio.account, config.twilio.api_key, config.twilio.secret,
            {
                ttl: MAX_ALLOWED_SESSION_DURATION,
                identity: identity
            }
        );

        // Assign the generated identity to the token.
        token.identity = identity;

        // Grant the access token Twilio Video capabilities.
        const grant = new VideoGrant();
        token.addGrant(grant);

        // Serialize the token to a JWT string and include it in a JSON response.
        res.send({
            identity: identity,
            token: token.toJwt()
        });
    });
});
