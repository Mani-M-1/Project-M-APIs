const express = require('express');
const router = express.Router();
const {v4 : uuidv4} = require('uuid')

const Project = require('../Models/Project');
const Organization = require('../Models/Organization');
const Task = require('../Models/Task');



// create project 
router.post('/', async (req, res) => {
    const user = await Organization.findOne({organizationId: req.body.userId});

    const projects = await Project.find({organizationId: req.body.userId});

    

    let numberForProjectShortId;
    if (projects.length < 1) {
        numberForProjectShortId = 0;
    }
    else {
        numberForProjectShortId = projects.length;
    }


    // for creating array of words 

    let projectWordsStartingLetter;
    if (req.body && req.body.projectTitle) {
        if (req.body.projectTitle.split(' ')) {
            let projectWordsArr = req.body.projectTitle.split(' ');

            // for getting starting letters of each word 
            projectWordsStartingLetter = projectWordsArr.map(eachWord => eachWord[0].toUpperCase());

        }else {
            let projectWord= req.body.projectTitle
            projectWordsStartingLetter = projectWord.slice(1, 0).toUpperCase();
        }
    }



    // for joining letters into projectShortId 
    const  projectShortId = projectWordsStartingLetter.join('') + '-' + numberForProjectShortId ;





    if (!user) {
        res.status(404).json({err_msg: 'User not found'});
    }
    else {
        try {
            const project = new Project({
                // projectId => example: "0project-m",
                // projectShortId => example: "PM-1",
                projectId: uuidv4(),
                projectShortId,
                projectTitle: req.body.projectTitle,
                projectDescription: req.body.projectDescription,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
                projectOwner: user.email,
                organizationId: user.organizationId
            })
    
            await project.save();
            
            res.status(200).json(project);
        }
        catch(err) {
            res.status(500).json({err_msg: err});
        }
    }

    
}) 



// get all projects
router.get('/find/:orgId', async (req, res) => {
    try {
        const {orgId} = req.params;
        
        const projects = req.query.search_q !== '' ? await Project.find({$and: [{projectTitle: new RegExp(req.query.search_q, 'i')}, {organizationId: orgId}]}) : await Project.find({organizationId: orgId});
         
        res.status(200).json(projects);

    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 



// get specific project by id
router.get('/:projectId/:orgId', async (req, res) => {
    try {


        const usersFromSameOrganization = await Organization.find({organizationId: req.params.orgId})

        if (usersFromSameOrganization.length < 1) {
            res.status(404).json({err_msg: "Organization Doesn't Exist"})
        }
        else {
            const project = await Project.findOne({projectId: req.params.projectId})
            

            res.status(200).json({usersFromSameOrganization, projectDetails: project});
        }

    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


// update a specific project by id
router.put('/:projectId', async (req, res) => {
    try {
        const updatedProject = await Project.updateOne({projectId: req.params.projectId}, {
            $set: req.body
        }, {new: true})

       res.status(200).json(updatedProject)
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


// delete a specific project by id
router.delete('/:projectId', async (req, res) => {
    try {
        console.log(req.params.projectId)

        // deleting a specific project by it's "projectId"
        const deletedProject = await Project.deleteOne({projectId: req.params.projectId})
        
        // deleting a "all tasks" of a specific "project"
        const deletedTasks = await Task.deleteMany({projectId: req.params.projectId})

        res.status(200).json({message: 'Project and Tasks related to that project are Deleted Successfully'})
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


module.exports = router;