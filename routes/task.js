const express = require('express');
const router = express.Router();
const {v4 : uuidv4} = require('uuid')


const Task = require('../Models/Task');
const Project = require('../Models/Project');
const Organization = require('../Models/Organization');



// create Task 
router.post('/createTask', async (req, res) => {
    

    const project = await Project.findOne({projectId: req.body.projectId})


    if (!project) {
        res.status(404).json({err_msg: 'Project Title not found, check whether project exists!'});
    }
    else {
        try {

            // getting all tasks based on "projectId"
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



            



            // creating "task" object 
            const task = new Task({
                // projectTitle: req.body.projectTitle,
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

            await task.save();

            res.status(200).json(task);
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
            // console.log(task)

            const project = await Project.findOne({projectId: task.projectId})

            const {projectTitle} = project._doc;
            // console.log(projectTitle)
            

            res.status(200).json({usersFromSameOrganization, taskDetails: {...task._doc, projectTitle}});
        }
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


// update a specific Task by id
router.put('/:id', async (req, res) => {
    try {
        const updatedTask = await Task.updateOne({taskId: req.params.id}, {
            $set: req.body
        }, {new: true})

       res.status(200).json(updatedTask)
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


// delete a specific Task by id
router.delete('/:id', async (req, res) => {
    try {
       await Task.findByIdAndDelete(req.params.id)
       res.status(200).json({message: 'Task Deleted Successfully'})
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


module.exports = router;