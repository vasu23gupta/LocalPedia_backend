const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    img:
    {
        data: Buffer,
        contentType: String
    },
    vendorId:{
        type: String,
        required: true,
    },
},{timestamps : true});

module.exports = mongoose.model('Image', ImageSchema);