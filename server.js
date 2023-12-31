const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const config = require('./config');

//importing required routes
const signupRoute = require('./routes/signup')
const loginRoute = require('./routes/login')
const projectRoute = require('./routes/project')
const taskRoute = require('./routes/task')
const profileRoute = require('./routes/profile')
const manageUsersRoute = require('./routes/manageUsers')
const riseIssueRoute = require('./routes/issue')


//port value 
const port = process.env.PORT || 8080

//importing db connection 
const connectDB = require('./db/connect');

//creating app server
const app = express();


//initializing db connection
connectDB();


//using required middlewares for "parsing json bodies" and "also for using different ports"
app.use(express.json());

app.use(cors());



//cutomized cors error handling "Note: This should be written before using 'routes'"
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }

    next();
})






//to see get request in cyclic i have written this code
app.get("/", (req, res, next)=>{
    res.json({
        name:"hello",
        message:"i am working"
    })
})

//using routes 
app.use('/signup', signupRoute)
app.use('/login', loginRoute)
app.use('/project', projectRoute)
app.use('/task', taskRoute)
app.use('/profile', profileRoute)
app.use('/manage-users', manageUsersRoute)
app.use('/rise-issue', riseIssueRoute)




// console logging "environment" and other details

console.log(`NODE_ENV=${config.NODE_ENV}`);
console.log(`${config.HOST}`);
console.log(`${config.MONGOOSE_URI}`);







//below code is used to show error message
app.use((req, res, next) => {
    const error = new Error('Not Found'); //Not Found is assigned to Error as "message"
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message //message is and inbuilt property to get error message given to "Error" method
        }
    });
});







//app listening at given port
app.listen(port, () => {
    console.log(`server listening at ${port}`)
})