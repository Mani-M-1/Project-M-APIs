const express = require('express');
const router = express.Router();



const Organization = require('../Models/Organization');



//for getting profile details 
router.get('/:id', async (req, res) => {
    try {
        const user = await Organization.findById(req.params.id);
        res.status(200).json({userDetails: user});
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
})



//for updating profile details 
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await Organization.findByIdAndUpdate(req.params.id, {
            $set: req.body
        },
        {new: true}
        );
        res.status(200).json({userDetails: updatedUser});
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
})


module.exports = router;