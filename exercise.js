mongoose = require('mongoose')

let exerciseSchema = new mongoose.Schema({
    uid: String,
    description: String,
    duration: Number,
    date: Number
})

module.exports = mongoose.model('Exercise', exerciseSchema)