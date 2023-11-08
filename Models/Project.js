const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectId: {type: String, required: true},
    projectShortId: {type: String, required: true},
    projectTitle: {type: String, required: true},
    projectDescription: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    projectOwner: {type: String, required: true},
    organizationId: {type: String, required: true}
    // tasks: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Task'
    // }]
})


module.exports = mongoose.model('Project', projectSchema);