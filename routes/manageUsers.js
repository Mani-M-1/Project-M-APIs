const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Organization = require('../Models/Organization');





// add user to organization 
router.post('/add-user/:orgId', async (req, res) => {
    const {orgId} = req.params;
    
    const userFromDb = await Organization.findOne({username: req.body.username, organizationId: orgId});
    // console.log(userFromDb)
    
    const emailFromDb = await Organization.findOne({email: req.body.email, organizationId: orgId});
    // console.log(emailFromDb)
    
    const orgDetails = await Organization.findOne({ _id: req.body.adminId, organizationId: orgId});
    // console.log(orgDetails)
    

    try {

        if (!userFromDb) { // checking whether "username" already exists in database
            if (!emailFromDb) {  // checking whether "email" already exists in database


                if (!orgDetails) {  // checking whether "organization" already exists in database
                    res.status(404).json({err_msg: 'No Organization found on the given orgId'});
                }
                else {

                    // const tempUsername = req.body.email.split("@")[0];

                    const user = await Organization({
                        // username: tempUsername,
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password,
                        organizationId: orgId,
                        // organizationId: "646363",
                        organizationName: orgDetails.organizationName,
                        role: req.body.role,
                        createdDate: new Date()
                    });

                    await user.save();

                    

                    // Email code 

                    const output = `
                    <b>Hi ${req.body.username}</b>
                    <p>You have a request from ( ${orgDetails.email} ) to join Project-M</p>
                    <p>Your temporary details are created by your Admin, use those details to login to Project-M application</p>
                    <b>Details:</b>
                    <ul style="padding: 0;">
                    <li style="list-style-type: none;">Username: ${req.body.username}</li>
                    <li style="list-style-type: none;">Email: ${req.body.email}</li>
                    <li style="list-style-type: none;">Password: ${req.body.password}</li>
                    </ul>
                    </br>
                    <p>Please <a href="${req.body.frontendUrl}/login" target="_blank"> click here </a> to enter the Project-M Application
                    </br>
                    </hr>
                    <b>Note:</b>
                    <p>1) Please don't share these information to anyone</p>
                    <p>2) You have an option to change these temporary details after you logged into the Project-M application</p>
                    <p>3) Just click on "Profile" in your menu to change any details</p>`


                    // console.log(output)

                    const config = {
                        service: 'gmail',
                        auth: {
                            user: orgDetails.email,
                            pass: process.env.MAIL_PASS
                        }
                    }


                    const transporter = nodemailer.createTransport(config)
                    // const transporter = nodemailer.createTransport({
                    //     host: "smtp.ethereal.email",
                    //     port: 587,
                    //     secure: false,
                    //     // port: 465,
                    //     // secure: true,
                    //     auth: {
                    //         // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                    //         user: "noah.von95@ethereal.email",
                    //         pass: "CWcWbreGA3jx7sZS5b",
                    //     },
                    //     tls: {
                    //         rejectUnauthorized: false
                    //     }
                    // });

                    // async..await is not allowed in global scope, must use a wrapper
                    async function main() {
                        // send mail with defined transport object
                        const info = await transporter.sendMail({
                            // from: '"Manikanta 👻" <foo@noah.von95@ethereal.email>', // sender address
                            // from: 'noah.von95@ethereal.email',
                            from: `${orgDetails.email}`,
                            // to: 'biyiwo3735@ustorp.com',
                            // to: 'kethavatsriram123@gmail.com',
                            to: `${req.body.email}`, // list of receivers
                            subject: "Action Required: This is the mail from your Team", // Subject line
                            text: "Hello world?", // plain text body
                            html: output, // html body
                        });

                        console.log("Message sent: %s", info.messageId);

                    }

                    main()
                    .catch(err => res.status(404).json({err_msg: 'Email not sent, due to some errors'}))


                    // success response to frontend 
                    res.status(200).json({message:'User added and Email sent successfully'})

                }


            }
            else {
                res.status(404).json({err_msg: 'Email already exists'});
            }
        }
        else {
            res.status(404).json({err_msg: 'Username already exists'});
        }
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
    
})













// get all users of specific organization
router.get('/find/:orgId', async (req, res) => {
    try {
        
        const users = req.query.search_q.length ? await Organization.find({$and: [{username: new RegExp(req.query.search_q, 'i')}, {organizationId: req.params.orgId}]}) : await Organization.find({organizationId: req.params.orgId});
       
        res.status(200).json(users);

    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 



// get specific user by id
router.get('/:id', async (req, res) => {
    try {
        const user = await Organization.findById({_id: req.params.id});

        res.status(200).json(user);
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


// update a specific user by id
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await Organization.findByIdAndUpdate({_id: req.params.id}, {
            $set: req.body
        }, {new: true})

       res.status(200).json(updatedUser)
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 


// delete a specific user by id
router.delete('/:id', async (req, res) => {
    try {
       await Organization.findByIdAndDelete({_id: req.params.id})
       res.status(200).json({message: 'User Deleted Successfully'})
    }
    catch(err) {
        res.status(500).json({err_msg: err});
    }
}) 





module.exports = router;