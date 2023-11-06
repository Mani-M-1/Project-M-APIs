const express = require('express');
const router = express.Router();
// const CryptoJS = require("crypto-js");


const Issue = require('../Models/Issue');


// creating a issue
router.post('/', async (req, res) => {
    try {
        const issue = new Issue({
            email: req.body.email,
            issueTitle: req.body.issueTitle,
            issueDescription: req.body.issueDescription,
            issueStatus: req.body.issueStatus,
            createdOn: new Date() 
        }); 

        await issue.save();

        res.status(200).json({message: 'Issue Submitted Successfully'});
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
});


// geeting all issues
router.get('/find', async (req, res) => {
    try {
        const issues = req.query.search_q !== '' 
            ? await Issue.find(
                {
                    $or: [
                        {issueTitle: new RegExp(req.query.search_q, 'i')},
                        {issueDescription: new RegExp(req.query.search_q, 'i')}
                    ]
                }
            ) 
            : await Issue.find();
         
        res.status(200).json(issues);

    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 



module.exports = router;