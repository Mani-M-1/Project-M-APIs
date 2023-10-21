const mongoose = require('mongoose');
// const dotenv = require('dotenv');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URI);
        console.log('DB connected successfully');
    }
    catch(err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;