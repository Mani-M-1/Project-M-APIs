const express = require('express');
const router = express.Router();
// const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const Organization = require('../Models/Organization');

router.post('/', async (req, res) => {
    try {
        const organizationDetails = await Organization.findOne({email: req.body.email});

        if (!organizationDetails) {
            res.status(401).json({err_msg: "Invalid Email"});
        }
        else {
            // const hashedPassword = CryptoJS.AES.decrypt(organizationDetails.password, process.env.PASS_SEC);
            // const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        
            // if (OriginalPassword !== req.body.password) {
            if (organizationDetails.password !== req.body.password) {
                res.status(401).json({err_msg: "Invalid Password"});
            }
            else {
                const jwtToken = jwt.sign({
                        id: organizationDetails._id,
                        isAdmin: organizationDetails.isAdmin
                    }, 
                    process.env.JWT_SEC,
                    {expiresIn: "3d"}
                )

                const {password, ...others} = organizationDetails._doc

                res.status(200).json({
                    ...others,
                    jwt_token: jwtToken
                });
            }
        }
    }
    catch(err) {
        res.status(500).json({err_msg: err})
    }
});


module.exports = router;