const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const admin = require('../firebaseAdminSdk');

// get all reviews (for testing)
router.get('/', async (req, res) => {
    try {
        const review = await Review.find();
        res.json(review);
    } catch (err) {
        res.json({ message: err });
    }
});

//get one review by id
router.get('/:reviewId', async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId).populate('by', 'username');
        res.json(review);
    } catch (err) {
        res.json({ message: err });
    }
});

//get one review using userid and vendorid
router.get('/userAndVendorId/:vendorId', async (req, res) => {
    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;
        const review = await Review.find(
            {
                by: userId,
                vendorId: req.params.vendorId,
            }
        ).populate('by', 'username');
        res.json(review[0]);
    } catch (err) {
        res.json({ message: err });
    }
});

//add review
router.post('/', async (req, res) => {
    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;
        var vendor = await Vendor.findById(
            req.body.vendorId,
            {
                reviewers: 1,
            }
        ).lean();

        if (vendor.reviewers.includes(userId)) {
            res.json({ message: 'You have already reviewed this vendor.' });
            return;
        }

        const review = new Review({
            by: userId,
            review: req.body.review,
            stars: req.body.stars,
            vendorId: req.body.vendorId,
        });


        const savedReview = await review.save();
        const updatedUser = await User.updateOne({ _id: userId }, {
            $push: {
                reviews: savedReview._id,
                vendorsReviewedByMe: req.body.vendorId
            },
        });
        var vendor = await Vendor.findByIdAndUpdate({ _id: req.body.vendorId }, {
            $push: {
                reviews: savedReview._id,
                reviewers: userId
            },
            $inc: { totalReviews: 1, totalStars: savedReview.stars },
        }, { new: true });
        const totalReviews = vendor.totalReviews;
        const totalStars = vendor.totalStars;
        var rating = totalStars / totalReviews;
        rating = Math.round((rating + Number.EPSILON) * 100) / 100

        var updatedVendor = await Vendor.updateOne({ _id: req.body.vendorId }, {
            $set: { rating: rating }
        });
        res.json(savedReview);
    } catch (err) {
        console.log(err);
        res.json({ message: err });
    }
});

//delete review, user can only delete his own review
router.delete('/:reviewId', async (req, res) => {
    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;
        const review = await Review.findById(req.params.reviewId);
        if (review.by != userId) return;

        var vendor = await Vendor.findByIdAndUpdate(review.vendorId,
            {
                $pull: {
                    reviewers: review.by,
                    reviews: review._id,
                },
                $inc: { totalReviews: -1, totalStars: -(review.stars) }
            }, { totalReviews: 1, totalStars: 1, _id: 0 }
        );

        const totalReviews = vendor.totalReviews;
        const totalStars = vendor.totalStars;
        var rating = totalStars / totalReviews;
        rating = Math.round((rating + Number.EPSILON) * 100) / 100
        var updatedVendor = await Vendor.updateOne({ _id: review.vendorId }, {
            $set: { rating: rating }
        });

        var user = await User.findByIdAndUpdate(review.by, {
            $pull: {
                reviews: review._id,
                vendorsReviewedByMe: review.vendorId,
            }
        });

        const removedReview = await Review.deleteOne({ _id: req.params.reviewId });

        res.json(removedReview);
    } catch (err) {
        res.json({ message: err });
    }
});

//update review
router.patch('/:reviewId', async (req, res) => {
    try {
        const updatedReview = await Review.updateOne({ _id: req.params.reviewId }, {
            $set: {
                //set params
            }
        });
        res.json(updatedDataVendor);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;

function print(string) {
    console.log(string);
}