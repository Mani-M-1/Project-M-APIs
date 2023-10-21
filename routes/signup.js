const express = require('express');
const router = express.Router();
// const CryptoJS = require("crypto-js");


const Organization = require('../Models/Organization');

router.post('/', async (req, res) => {
    const signedUser = await Organization.findOne({username: req.body.username});
    const signedEmail = await Organization.findOne({email: req.body.email});


    let randomOrganizationId;
    let adminValue = false;
    if (!req.body.organizationId) {

        function getRandomSixDigits() {
            return Math.floor(100000 + Math.random() * 900000);
        }
        randomOrganizationId = getRandomSixDigits()

        adminValue = true;

    } 
    else {
        randomOrganizationId = req.body.organizationId;
    }

    

    if (!signedUser) {
        if (!signedEmail) {
            try {
                const organization = await Organization({
                    username: req.body.username,
                    email: req.body.email,
                    // password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC),
                    password: req.body.password,
                    isAdmin: adminValue,
                    organizationName: req.body.organizationName,
                    organizationId: randomOrganizationId,
                    role: req.body.role,
                    createdDate: new Date()
                }); 

                await organization.save();

                res.status(200).json({message: 'User Created Successfully'});
            }
            catch(err) {
                res.status(500).json({err_msg: err});
            }
        }
        else {
            res.status(401).json({err_msg: 'Email Already Exists'});
        }
    }
    else {
        res.status(401).json({err_msg: 'User Already Exists'});
    }
});


module.exports = router;