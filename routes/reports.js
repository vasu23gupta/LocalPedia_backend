const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const admin = require('../firebaseAdminSdk');

// get all reports (for testing)
router.get('/', async (req, res) => {
    try {
        const report = await Report.find();
        res.json(report);
    } catch (err) {
        res.json({ message: err });
    }
});

//get one report by id
router.get('/:reportId', async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId);
        res.json(report);
    } catch (err) {
        res.json({ message: err });
    }
});

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
        print(vendor);
        if (vendor.reporters.includes(userId)) {
            res.json({ message: 'You have already reviewed this vendor.' });
            return;
        }else print('doesnt');

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
        print(updatedUser);
        var updatedVendor = await Vendor.updateOne({ _id: req.body.vendorId }, {
            $push: {
                reports: savedReport._id,
                reporters: userId
            },
            $inc: { totalReports: 1, },
        });
        print(updatedVendor);
        print(savedReport);
        res.json(savedReport);
    } catch (err) {
        print(err);
        res.json({ message: err });
    }
});

//delete report
router.delete('/:reportId', async (req, res) => {
    try {
        const removedReport = await Report.deleteOne({ _id: req.params.reportId });
        res.json(removedReport);
    } catch (err) {
        res.json({ message: err });
    }
});

//update report
router.patch('/:reportId', async (req, res) => {
    try {
        const updatedReport = await Report.updateOne({ _id: req.params.reportId }, {
            $set: {
                //set params
                reports: reports.add(req.body.Report),

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