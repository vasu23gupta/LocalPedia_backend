const express = require('express');
const fs = require('fs');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Image = require('../models/Image');
const multer = require('multer');
//const deepai = require('deepai');
//deepai.setApiKey('506d04ca-79e2-4daa-97cd-7eb4c8722a1a');

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024
    }
});

//get an image by id
router.get('/:imageId', async (req, res) => {
    //https://stackoverflow.com/questions/28440369/rendering-a-base64-png-with-express
    try {
        var imageBase64 = await Image.findById(req.params.imageId);
        imageBase64 = imageBase64['img']['data'];
        const image = Buffer.from(imageBase64, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image',
            'Content-Length': image.length
        });
        res.end(image);
    } catch (err) {
        res.json({ message: err });
    }
});

//upload an image
router.post('/', upload.single('vendorImg'), async function (req, res) {
    var f = req.file;
    var image = new Image();
    image.img.data = fs.readFileSync(f.path);
    image.img.contentType = f.mimetype;
    image.vendorId = req.body.vendorId;
    try {
        const savedImage = await image.save();
        var updatedVendor = await Vendor.updateOne({ _id: req.body.vendorId }, {
            $push: {
                images: savedImage._id
            },
        });
        res.json(savedImage);
    } catch (err) {
        res.json({ message: err });
    }
    // var score = 0;
    // try {
    //     var resp = await deepai.callStandardApi("nsfw-detector", {
    //         image: fs.createReadStream(f.path),
    //     });
    //     score = resp.output.nsfw_score;
    //     //console.log(score);
    // } catch (err) {
    //     console.log(err);
    // }

    // if(score<0.15){
    //     try {
    //         const savedImage = await image.save();
    //         var updatedVendor = await Vendor.updateOne({ _id: req.body.vendorId }, {
    //             $push: {
    //                 images: savedImage._id
    //             },
    //         });

    //         res.json(savedImage);
    //     } catch (err) {
    //         res.json({ message: err });
    //     }
    // }
    // else{
    //     res.json({"imageRejected":true});
    // }
});

router.patch('/deleteImages',async (req,res)=>{
    try{
        const removedImageIds=await Image.deleteMany({ _id: {$in: req.body.imageIds}});
        console.log("removed");
        res.json(removedImageIds);
    }
    catch(err)
    {
        res.json({message: err});
    }
})
// router.post('/:vendorImg',async function (req, res) {
//     // var f = req.file;
//     var image = new Image();
//     image.img.data = req.params.vendorImg;
//     image.img.contentType = "";


//     try {
//         const savedImage = await image.save();
//         res.json(savedImage);
//     } catch (err) {
//         res.json({ message: err });
//     }
// });

module.exports = router;