const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
    vendor: {
        type: String,
        required: true
    },
    by:{
        type: String,
        required: true
    },
    report: {
        type: String,
        required: true,
    },
},{timestamps : true});

module.exports = mongoose.model('Report', ReportSchema);