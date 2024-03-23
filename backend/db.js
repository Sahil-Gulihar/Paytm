const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/paytm')

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
})

// Create model from schema
const User = mongoose.model('User' , UserSchema);


const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model('Account',accountSchema);

module.exports = {
    User,
    Account
};
