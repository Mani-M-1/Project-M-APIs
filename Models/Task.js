const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
	//taskId should be combination of projectname and it should start with random numbers (starting from 0 to 1000) ex: 0createapis
	taskId: {type: String, required: true, unique: true},
	taskShortId: {type: String, required: true},
	taskTitle: {type: String, required: true},
	taskDescription: {type: String, required: true},
	assignedTo: {type: String, required: true},
	startDate: {type: Date, required: true},
	endDate: {type: Date, required: true},
	taskStatus: {type: String, required: true, default: "todo"},
	// projectId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Project'
    // },
	projectId: {type: String, required: true},
	createdBy: {type: String, required: true},
	createdDate: {type: Date, required: true}
});


module.exports = mongoose.model('Task', taskSchema);