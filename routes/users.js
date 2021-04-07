const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('../firebaseAdminSdk');

// get all users (for testing)
router.get('/', async (req, res) => {
    try {
        const user = await User.find();
        res.json(user);
    } catch (err) {
        res.json({ message: err });
    }
});

//get one user by id
router.get('/getUserByJWT', async (req, res) => {
    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;
        const user = await User.findById(userId);
        res.json(user);
    } catch (err) {
        res.json({ message: err });
    }
});

//add user
router.post('/', async (req, res) => {
    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;
        const user = new User({
            _id: userId,
            username: req.body.username,
            nextLevelAt: 100,
            points:0,
            level:0
        });
        const savedUser = await user.save();
        res.json(savedUser);
    } catch (err) {
        res.json({ message: err });
    }
});

//google login
router.post('/google', async (req, res) => {
    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider != 'google.com') return;
        var userId = userObj.uid;
        var user = await User.findById(userId);
        if (user == null) {
            user = new User({
                _id: userId,
                username: req.body.username,
                nextLevelAt: 100,
                points:0,
                level:0
            });
            const savedUser = await user.save();
            res.json(savedUser);
        }
        else res.json(user);
    } catch (err) {
        res.json({ message: err });
    }
});

//delete user
router.delete('/:userId', async (req, res) => {
    try {
        const removedUser = await User.deleteOne({ _id: req.params.userId });
        res.json(removedUser);
    } catch (err) {
        res.json({ message: err });
    }
});

//add vendor to user
router.patch('/:userId', async (req, res) => {
    try {
        const updatedUser = await User.updateOne({ _id: req.params.userId }, {
            $push: {
                vendors: req.body.vendorId
            },
        });
        res.json(updatedUser);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;