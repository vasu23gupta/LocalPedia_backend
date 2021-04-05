const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const admin = require('../firebaseAdminSdk');
const { response } = require('express');

// async function getUserFromJwt(jwt) {
//     var obj = await admin.auth().verifyIdToken(jwt);
//     if (obj.firebase.sign_in_provider == 'anonymous') { return 'anonymous'; }
//     var user = await User.findById(obj.uid);
//     return user;
// }

//test auth
// router.post('/test', async (req, res) => {
//     var user = await getUserFromJwt(req.get('authorisation'));
// });


// get all vendors for debugging
router.get('/', async (req, res) => {
    try {
        const vendors = await Vendor.find();
        res.json(vendors);
    } catch (err) {
        res.json({ message: err });
    }
});

//get one vendor by id
router.get('/:vendorId', async (req, res) => {
    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        const userId = userObj.uid;

        var vendor = await Vendor.findById(
            req.params.vendorId,
            {
                totalStars: 0,
                totalReviews: 0,
                reports: 0,
                totalReports: 0,
            }
        ).lean(); //lean converts docs to json

        if (vendor.reviewers.includes(userId)) vendor['reviewed'] = true;
        else vendor['reviewed'] = false;

        if (vendor.reporters.includes(userId)) vendor['reported'] = true;
        else vendor['reported'] = false;

        delete vendor['reviewers'];
        delete vendor['reporters'];

        res.json(vendor);
    } catch (err) {
        res.json({ message: err });
    }
});

//get one vendor by id with optional parameters, not in use rn
router.get('/:vendorId/:name/:tags/:location/:description/:images/:reviews/:rating', async (req, res) => {
    //    if (req.params.vendorId=="null") {
    try {
        const vendor = await Vendor.findById({ _id: req.params.vendorId }, {
            _id: 0,
            __v: 0,
            name: req.params.name == 'true' ? 1 : 0,
            location: req.params.location == 'true' ? 1 : 0,
            tags: req.params.tags == 'true' ? 1 : 0,
            images: req.params.images == 'true' ? 1 : 0,
            description: req.params.description == 'true' ? 1 : 0,
            reviews: req.params.reviews == 'true' ? 1 : 0,
            rating: req.params.rating == 'true' ? 1 : 0
        });
        res.json(vendor);
    } catch (err) {
        res.json({ message: err });
    }
    //    }
    // else{
    //     try {
    //         const vendor = await Vendor.findById(req.params.vendorId);
    //         res.json(vendor);
    //     } catch (err) {
    //         res.json({ message: err });
    //     }
    // }
});

//get all within bounds
router.get('/:neLat/:neLng/:swLat/:swLng', async (req, res) => {
    var neLat = req.params.neLat;
    var neLng = req.params.neLng;
    var swLat = req.params.swLat;
    var swLng = req.params.swLng;
    Vendor.find({
        location: {
            $geoWithin: {
                $geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [neLng, neLat],
                        [neLng, swLat],
                        [swLng, swLat],
                        [swLng, neLat],
                        [neLng, neLat]
                    ]]
                }
            }
        }
    }, { location: true, tags: true }).exec(function (err, docs) {
        if (err) {
            res.json({ message: err });
        }
        else {
            res.json(docs);
        }
    });

});

//search
router.get('/search/:query/:radius/:lat/:long', async (req, res) => {

    let radius = parseFloat(req.params.radius);
    let lat = parseFloat(req.params.lat);
    let long = parseFloat(req.params.long);
    let searchText = req.params.query;
    var radiusSearch;
    searchText = searchText.trim();
    //let searchRegex= searchText;
    var searchTexts = searchText.split(" ");
    var searchTextList = [];
    for (i = 0; i < searchTexts.length; i++) {
        var reg = new RegExp(searchTexts[i], "i")
        searchTextList.push({
            name: {
                $regex: reg
            }
        })
        searchTextList.push({
            tags: {
                $regex: reg
            }
        })
    }
    var fullTextSearchOptions = {
        "$text": {
            "$search": searchText
        }
    };
    var regexSearchOptions;
    if (!(radius == "0")) {
        console.log("entered");
        console.log(radius + " " + long + " " + lat + " " + radius / (1.609 * 3963.2));
        //https://docs.mongodb.com/manual/reference/operator/query/nearSphere/
        radiusSearch = {
            "location.coordinates": {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [long, lat]
                    },
                    $maxDistance: radius * 1000
                }
            }
        };
        regexSearchOptions = {
            $and: [{ $or: searchTextList }, radiusSearch]
        };

    }
    else {

        regexSearchOptions = {
            $or: searchTextList
        };
        Vendor.find(regexSearchOptions, { name: 1, tags: 1, rating: 1, location: 1, createdAt: 1 }, function (err, docs) {

            if (err) {
                res.json({ message: err });
            } else if (docs) {
                res.json(docs);
            }

        });
    }
    //res.json({message:searchString});
    /* try {
        const vendors=await Vendor.find({$text:{$search: searchString}})
        for (var i=0;i<vendors.length;i++)
        {
            vendors[i]=json(vendors[i]);
        }
        res.json(vendors)
    }catch(err)
    {
        res.json({message: err})
    } */

    // const searchString=req.params.query;
    // Vendor.find({$text:{$search: searchString}}).exec(function(err,docs){
    //     if(err) {
    //         res.json({message: err});
    //     }
    //     else{
    //         res.json(docs);
    //     }
    // });
})

//filter on map
router.get('/filterOnMap/:neLat/:neLng/:swLat/:swLng', async (req, res) => {
    //https://stackoverflow.com/questions/18148166/find-document-with-array-that-contains-a-specific-value
    var tagsList = req.query.query;
    var neLat = req.params.neLat;
    var neLng = req.params.neLng;
    var swLat = req.params.swLat;
    var swLng = req.params.swLng;
    Vendor.find({
        tags: { $in: tagsList },
        location: {
            $geoWithin: {
                $geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [neLng, neLat],
                        [neLng, swLat],
                        [swLng, swLat],
                        [swLng, neLat],
                        [neLng, neLat]
                    ]]
                }
            }
        }
    }, { location: 1, tags: 1 }, function (err, docs) {

        if (err) {
            res.json({ message: err });
        } else if (docs) {
            res.json(docs);
        }

    });
});

//add a vendor
router.post('/', async (req, res) => {

    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;

        const vendor = new Vendor({
            name: req.body.name,
            location: { coordinates: [req.body.lng, req.body.lat] },
            tags: req.body.tags,
            description: req.body.description,
            totalReviews: 0,
            totalStars: 0,
            rating: 0,
            totalReports: 0,
            postedBy: userId,
            address: req.body.address,
        });

        const savedVendor = await vendor.save()
        const user = await User.findOne({_id: userId})
        const points = user.points;
        var level=user.level
        var nextLevelAt=user.nextLevelAt
        if(points+50>=user.nextLevelAt)
        {
            level=user.level+1
            nextLevelAt=(25*(level+1)*(level+1))+75*(level+1)
        }
        const updatedUser = await User.updateOne({ _id: userId }, {
            $push: {
                vendors: savedVendor._id
            },
            $set: {
                points: points + 50,
                level:level,
                nextLevelAt:nextLevelAt,
            }
        });
        res.json(savedVendor);
    } catch (err) {
        res.json({ message: err });
    }
});

//delete vendor, not in use rn
router.delete('/:vendorId', async (req, res) => {
    try {
        const removedVendor = await Vendor.deleteOne({ _id: req.params.vendorId });
        res.json(removedVendor);
    } catch (err) {
        res.json({ message: err });
    }
});

//add report
router.patch('/report/:vendorId', async (req, res) => {

    try {
 
        var response = await Vendor.updateOne({ _id: req.params.vendorId }, {
            $push: {
                reports: req.body.reportId
            },
            $inc: { totalReports: 1 },
        });

        // if((await Vendor.findById(req.params.vendorId,{totalReports:1, _id:0})).totalReports>=10){
        //     //delete maybe
        // }

        res.json(response);
    }
    catch (err) {
        res.json({ message: err });
    }
});

//edit
router.patch('/edit/:vendorId', async (req, res) => {

    try {
        var jwt = req.get('authorisation');
        var userObj = await admin.auth().verifyIdToken(jwt);
        if (userObj.firebase.sign_in_provider == 'anonymous') return;
        var userId = userObj.uid;
        await Vendor.updateOne({ _id: req.params.vendorId }, {
            $set: {
                name: req.body.name,
                location: { type: "Point", coordinates: [req.body.lng, req.body.lat] },
                tags: req.body.tags,
                images: req.body.images,
                description: req.body.description,
                address: req.body.address,
            }
        });
        const updatedVendor = await Vendor.findById(req.params.vendorId, { totalStars: 0, totalReviews: 0, reports: 0, totalReports: 0 });
        const user=await User.findOne({_id: userId})
        var points=user.points
        var level = user.level
        var nextLevelAt=user.nextLevelAt
        if(points+20>=nextLevelAt)
        {
            level=user.level+1
            nextLevelAt=(25*(level+1)*(level+1))+75*(level+1)
        }
        const updatedUser=await User.updateOne({_id:userId},{
            $set:{
                level:level,
                points:points+20,
                nextLevelAt:nextLevelAt,
            }
        });
        res.json(updatedVendor);
    }
    catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;


// router.post('/photo', upload.single('vendorImg'), async function(req,res){
//     var f = req.file;
//     var image = new Image();
//     image.img.data = fs.readFileSync(f.path)
//     image.img.contentType = f.mimetype;

//     try {
//         const savedImage = await image.save();
//         res.json(savedImage);
//     } catch (err) {
//         res.json({ message: err });
//     }
//    });

//add review
// router.patch('/review/:vendorId', async (req, res) => {

//     try {
//         var response = await Vendor.updateOne({ _id: req.params.vendorId }, {
//             $push: {
//                 reviews: req.body.reviewId
//             },
//             $inc: { totalReviews: 1, totalStars: req.body.stars },
//         });

//         var vendor = await Vendor.findById(req.params.vendorId, { totalReviews: 1, totalStars: 1, _id: 0 });
//         const totalReviews = vendor.totalReviews;
//         const totalStars = vendor.totalStars;
//         var rating = totalStars / totalReviews;
//         rating = Math.round((rating + Number.EPSILON) * 100) / 100

//         var updateResult = await Vendor.updateOne({ _id: req.params.vendorId }, {
//             $set: { rating: rating }
//         });

//         res.json(updateResult);
//     }
//     catch (err) {
//         res.json({ message: err });
//     }
// });