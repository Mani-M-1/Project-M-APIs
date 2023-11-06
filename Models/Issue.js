const mongoose = require('mongoose');

const issueShema = new mongoose.Schema({
    email: {type: String, required: true},
    issueTitle: {type: String, required: true},
    issueDescription: {type: String, required: true},
    issueStatus: {type: String, required: true, default: "inProgress"},
    createdOn: {type: Date, required: true}
})


module.exports = mongoose.model('Issue', issueShema);