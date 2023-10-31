const mongoose = require('mongoose');

const organizationShema = new mongoose.Schema({
    username: {type: String, required:true, unique: true}, // "required" key is removed because it should be optional for adding users
    email: {type: String, required: true, unique: true},
    password: {type: String}, // "required" key is removed because it should be optional for adding users
    role: {type: String, required: true, default: "Project Manager"},
    isAdmin: {type: Boolean, default: false},
    organizationName: {type: String, required: true},
    organizationId: {type: String, required: true}, //generate this id as a "six digit number"
    createdDate: {type: Date, required: true}
})


module.exports = mongoose.model('Organization', organizationShema);