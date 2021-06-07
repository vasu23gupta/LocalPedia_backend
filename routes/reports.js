const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Vendor = require('../models/Vendor').vendor;
const DeletedVendor = require('../models/Vendor').deletedVendor;
const admin = require('../firebaseAdminSdk');
const Image = require('../models/Image');
const Review = require('../models/Review');

// get all reports (for testing)
// router.get('/', async (req, res) => {
//     try {
//         const report = await Report.find();
//         res.json(report);
//     } catch (err) {
//         res.json({ message: err });
//     }
// });

//get one report by id
// router.get('/:reportId', async (req, res) => {
//     try {
//         const report = await Report.findById(req.params.reportId);
//         res.json(report);
//     } catch (err) {
//         res.json({ message: err });
//     }
// });

//add report
router.post('/', async (req, res) => {

    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;
        var vendor = await Vendor.findById(
            req.body.vendorId,
            {
                reporters: 1,
            }
        ).lean();
        if (vendor.reporters.includes(userId)) {
            print('already reported');
            res.json({ message: 'You have already reported this vendor.' });
            return;
        }

        const report = new Report({
            by: userId,
            report: req.body.report,
            vendor: req.body.vendorId
        });

        const savedReport = await report.save();
        const updatedUser = await User.updateOne({ _id: userId }, {
            $push: {
                reportsByMe: savedReport._id,
                vendorsReportedByMe: req.body.vendorId
            },
        });
        var updatedVendor = await Vendor.findByIdAndUpdate(
            req.body.vendorId,
            {
                $push: {
                    reports: savedReport._id,
                    reporters: userId
                },
                $inc: { totalReports: 1, },
            },
            { new: true }
        ).lean();
        if (updatedVendor.totalReports >= 15) {
            // updatedVendor.images.forEach(element => {
            //     Image.deleteOne({ _id: element });
            // });
            console.log("entered")
            updatedVendor.reviews.forEach(element => {
                Review.deleteOne({ _id: element });
            });
            updatedVendor.reports.forEach(element => {
                Report.deleteOne({ _id: element });
            });
            const user = await User.findOne({_id: updatedVendor.postedBy})
            var points = user.points
            var level=user.level
            var nextLevelAt=user.nextLevelAt
            if(points-50<25*(level)*(level)+75*(level))
            {
                nextLevelAt=25*(level)*(level)+75*(level)
                level=level-1;
            }
            await User.updateOne({ _id: updatedVendor.postedBy }, { $set: {points:points-50,level:level,nextLevelAt:nextLevelAt,addsRemaining:0,editsRemaining:0}},{ $pull: { vendors: updatedVendor._id } });
            await User.updateMany({ vendorsReviewedByMe: { $in: updatedVendor._id } }, { $pull: { vendorsReviewedByMe: updatedVendor._id }, $pullAll: { reviews: updatedVendor.reviews } });
            await User.updateMany({ vendorsReportedByMe: { $in: updatedVendor._id } }, { $pull: { vendorsReportedByMe: updatedVendor._id }, $pullAll: { reportsByMe: updatedVendor.reports } });
            await DeletedVendor.insertMany([updatedVendor]);
            await Vendor.deleteOne({ _id: updatedVendor._id });
        }
        res.json(savedReport);
    } catch (err) {
        print(err);
        res.json({ message: err });
    }
});

//delete report
// router.delete('/:reportId', async (req, res) => {
//     try {
//         const removedReport = await Report.deleteOne({ _id: req.params.reportId });
//         res.json(removedReport);
//     } catch (err) {
//         res.json({ message: err });
//     }
// });

module.exports = router;

function print(string) { console.log(string); }