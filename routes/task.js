const express = require('express');
const router = express.Router();
const {v4 : uuidv4} = require('uuid')

const nodemailer = require('nodemailer');



const Task = require('../Models/Task');
const Project = require('../Models/Project');
const Organization = require('../Models/Organization');







// "TaskAddedEmailNotification" function to send emails for a particular user that his task is updated
const TaskAddedEmailNotification = async (orgDetails, task, userDetails) => {
    // Email code 

    const output = `
        <b>Hi ${task.assignedTo}</b>
        <p>You have a request from ( ${orgDetails.email} ) through Project-M</p>
        <p>A new Task has been assigned to you</p>
        <h4>Task Details:</h4>
        <ul style="padding: 0;">
            <li style="list-style-type: none;">TaskId: ${task.taskId}</li>
            <li style="list-style-type: none;">TaskShortId: ${task.taskShortId}</li>
            <li style="list-style-type: none;">TaskTitle: ${task.taskTitle}</li>
        </ul>
        <p>You can check the new tasks that are assigned to you in Project-M Application</p>
        <p>Please <a href="${process.env.FRONTEND_URL}/login" target="_blank"> click here </a> to enter the Project-M Application`
                


    // console.log(output)

    const config = {
        service: 'gmail',
        auth: {
            user: process.env.ORG_EMAIL, //organization email 
            pass: process.env.MAIL_PASS // organization email's password 
        }
    }


    const transporter = nodemailer.createTransport(config)

    const info = await transporter.sendMail({
        from: `${orgDetails.email}`,
        to: `${userDetails.email}`, // list of receivers
        subject: "Action Required: A Task has been assigned to you in Project-M Application", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
    });

    console.log("Message sent: %s", info.messageId);

}








// create Task 
router.post('/createTask', async (req, res) => {
    
    const project = await Project.findOne({projectId: req.body.projectId})

    
    
    if (!project) {
        res.status(404).json({err_msg: 'Project Title not found, check whether project exists!'});
    }
    else {
        try {


            const orgDetails = await Organization.findOne({_id: req.body.userId, organizationId: req.body.orgId})
            
            const userDetails = await Organization.findOne({username: req.body.assignedTo, organizationId: req.body.orgId})
            
            
            
            // getting all tasks based on "projectId" to get specific tasks of specific project
            const tasks = await Task.find({projectId: req.body.projectId});
    

            let numberForTaskshortId;
            if (tasks.length < 1) {
                numberForTaskshortId = 0;
            }
            else {
                numberForTaskshortId = tasks.length;
            }

            
            
            // for creating array of words 
            
            let taskWordsStartingLetter;
            if (req.body && req.body.taskTitle) {
                if (req.body.taskTitle.split(' ')) {
                    let taskWordsArr = req.body.taskTitle.split(' ');
                    
                    // for getting starting letters of each word 
                    taskWordsStartingLetter = taskWordsArr.map(eachWord => eachWord[0].toUpperCase());
                    
                }else {
                    let taskWord= req.body.taskTitle
                    taskWordsStartingLetter = taskWord.slice(1, 0).toUpperCase();
                }
            }
            
            
            // for joining letters into taskShortId 
            const  taskShortId = taskWordsStartingLetter.join('') + '-' + numberForTaskshortId ;
            console.log(taskShortId)


            // creating "task" object 
            const task = new Task({
                taskId: uuidv4(),
                taskShortId,
                taskTitle: req.body.taskTitle,
                taskDescription: req.body.taskDescription,
                assignedTo: req.body.assignedTo,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
                taskStatus: req.body.taskStatus,
                projectId: req.body.projectId,
                createdBy: project.projectOwner,
                createdDate: new Date()
            })

            const createdTask = await task.save();
            console.log(createdTask)

            
            
            // success response to frontend
            res.status(200).json(createdTask)
                

            try {

                TaskAddedEmailNotification(orgDetails, task, userDetails)

            }
            catch(err) {
                res.status(404).json({err_msg: 'Email not sent, due to some errors'})
            }
        }
        catch(err) {
            res.status(500).json({err_msg: err});
        }
    }
}) 




// get all tasks
router.get('/find', async (req, res) => {
    try {
        const tasks = req.query.search_q !== '' 
            ? await Task.find(
                {
                    $or: [
                        {taskTitle: new RegExp(req.query.search_q, 'i')},
                        {assignedTo: new RegExp(req.query.search_q, 'i')}
                    ]
                }
            ) 
            : await Task.find();
         
        res.status(200).json(tasks);

    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 



// get specific Task by "id"
router.get('/:id/:orgId', async (req, res) => {
    try {
        const usersFromSameOrganization = await Organization.find({organizationId: req.params.orgId})

        if (usersFromSameOrganization.length < 1) {
            res.status(404).json({err_msg: "Organization Doesn't Exist"})
        }
        else {
            const task = await Task.findOne({taskId: req.params.id})

            const project = await Project.findOne({projectId: task.projectId})

            const {projectTitle} = project._doc;
            

            res.status(200).json({usersFromSameOrganization, taskDetails: {...task._doc, projectTitle}});
        }
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 








// "TaskUpdateEmailNotification" function to send emails for a particular user that his task is updated
const TaskUpdateEmailNotification = async (orgDetails, userDetails, taskDetails) => {
    // Email code 

    const output = `
        <b>Hi ${taskDetails.assignedTo}</b>
        <p>You have a request from ( ${orgDetails.email} ) through Project-M</p>
        <p>A Task has been updated</p>
        <h4>Task Details:</h4>
        <ul style="padding: 0;">
            <li style="list-style-type: none;">TaskId: ${taskDetails.taskId}</li>
            <li style="list-style-type: none;">TaskShortId: ${taskDetails.taskShortId}</li>
            <li style="list-style-type: none;">TaskTitle: ${taskDetails.taskTitle}</li>
            <li style="list-style-type: none;">TaskStatus: ${taskDetails.taskStatus}</li>
        </ul>
        <p>You can check the updated task in Project-M Application</p>
        <p>Please <a href="${process.env.FRONTEND_URL}/login" target="_blank"> click here </a> to enter the Project-M Application`



    const config = {
        service: 'gmail',
        auth: {
            user: process.env.ORG_EMAIL, //organization email 
            pass: process.env.MAIL_PASS // organization email's password 
        }
    }


    const transporter = nodemailer.createTransport(config)

    const info = await transporter.sendMail({
        from: `${orgDetails.email}`,
        to: `${userDetails.email}`, // list of receivers
        subject: "Action Required: Your Task has been updated in Project-M Application", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
    });


    console.log("Message sent: %s", info.messageId);
}





// update a specific Task by id
router.put('/:id/:orgId/:userId', async (req, res) => {
    const {assignedTo, ...others} = req.body

    //this is to get task details to show in email 
    const taskDetails = await Task.findOne({taskId: req.params.id})
    
    const userDetails = await Organization.findOne({username: taskDetails.assignedTo, organizationId: req.params.orgId})
    
    if (!userDetails && !assignedTo) {
        res.status(404).json({err_msg: 'User has been deleted, please assign the task to other existing Employee'})
    }
    else if (!userDetails && assignedTo) {

        try {
            const orgDetails = await Organization.findOne({_id: req.params.userId, organizationId: req.params.orgId})
            
            const assigneeDetails = await Organization.findOne({username: assignedTo})

    
            const updatedTask = await Task.updateOne({taskId: req.params.id}, {
                $set: req.body
            }, {new: true})
    
           
    
    
            

            // success response to frontend
            res.status(200).json({message: "Task Updated Successfully"})

            try {
                
                
                TaskUpdateEmailNotification(orgDetails, assigneeDetails, taskDetails)
                
                
            }
            catch(err) {
                res.status(404).json({err_msg: 'Email not sent, due to some errors'})
            }
    
        }
        catch(err) {
            res.status(500).json({err_msg: err});
        }
    }
    else {

        try {
            const orgDetails = await Organization.findOne({_id: req.params.userId, organizationId: req.params.orgId})
            
    
            const updatedTask = await Task.updateOne({taskId: req.params.id}, {
                $set: req.body
            }, {new: true})
    
           
    
    
            

            // success response to frontend
            res.status(200).json({message: "Task Updated Successfully"})

            try {
                
                
                TaskUpdateEmailNotification(orgDetails, userDetails, taskDetails)
                
                
            }
            catch(err) {
                res.status(404).json({err_msg: 'Email not sent, due to some errors'})
            }
    
        }
        catch(err) {
            res.status(500).json({err_msg: err});
        }
    }

}) 





// delete a specific Task by id
router.delete('/:taskId', async (req, res) => {    
    try {
       await Task.deleteOne({taskId: req.params.taskId})
       res.status(200).json({message: 'Task Deleted Successfully'})
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


module.exports = router;