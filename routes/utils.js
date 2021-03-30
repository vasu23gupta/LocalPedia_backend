const express = require('express');
const router = express.Router();
const https = require('https');
const querystring = require('querystring');
const dotenv = require('dotenv');
dotenv.config();

// get all users (for testing)
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
        https.get('https://apis.mapmyindia.com/advancedmaps/v1/'+process.env.MMIKEY+'/rev_geocode?'+get_request_args, (ress) => {
            ress.setEncoding('utf8');
            ress.on('data', (chunk) => {
                output += chunk;
            });
            ress.on('end', () => {
                let obj = (output);
                res.json({"address":JSON.parse(obj).results[0].formatted_address});
            });
        });

    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;