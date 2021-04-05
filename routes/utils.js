const express = require('express');
const router = express.Router();
const https = require('https');
const querystring = require('querystring');
const admin = require('../firebaseAdminSdk');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// get address from latlng
router.get('/address/:lat/:lng', async (req, res) => {
    const lat = req.params.lat;
    const lng = req.params.lng;
    try {
        let output = '';
        const parameters = {
            lat: lat,
            lng: lng
        }
        const get_request_args = querystring.stringify(parameters);
        //http://apis.mapmyindia.com/advancedmaps/v1/6vt1tkshzvlqpibaoyklfn4lxiqpit2n/rev_geocode?lat=${point.latitude}&lng=${point.longitude}
        https.get('https://apis.mapmyindia.com/advancedmaps/v1/' + process.env.MMIKEY + '/rev_geocode?' + get_request_args, (ress) => {
            ress.setEncoding('utf8');
            ress.on('data', (chunk) => {
                output += chunk;
            });
            ress.on('end', () => {
                let obj = (output);
                res.json({ "address": JSON.parse(obj).results[0].formatted_address });
            });
        });

    } catch (err) {
        res.json({ message: err });
    }
});

//get azure maps api key
router.get('/mapApiKey', async (req, res) => {
    var jwt = req.get('authorisation');
    await admin
        .auth()
        .verifyIdToken(jwt, true)
        .then((payload) => {
            res.json({ "key": process.env.AZUREKEY });
        })
        .catch((error) => {
            if (error.code == 'auth/id-token-revoked') {
                res.status(err.status || 401).json(error);
            } else {
                res.status(err.status || 500).json(error);
            }
        });


});

//get TnC
router.get('/tnc', (req, res) => {
    fs.readFile('./views/tnc.html', 'utf8', (err, text) => {
        res.send(text);
    });
})

//get PP
router.get('/pp', (req, res) => {
    fs.readFile('./views/pp.html', 'utf8', (err, text) => {
        res.send(text);
    });
})

module.exports = router;