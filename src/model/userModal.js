const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: { 
        type: String, 
        required: true 
    },
    phonenumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
