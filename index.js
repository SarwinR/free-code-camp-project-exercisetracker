const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

let bodyParser = require('body-parser')

mongoose = require('mongoose')
let User = require('./user.js')
let Exercise = require('./exercise.js')

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', function(req, res){
    let user = new User({ username: req.body.username })
    
    user.save(function(err, data) {
        User.findOne({ username: req.body.username }, function(err, result){
            res.json({"username" : req.body.username,
                        "_id" : result["_id"] })
        })
    })
})

app.get('/api/users', function(req, res){
   User.find({}, function(err, result){
       res.json(result)
   })
})

app.post('/api/users/:_id/exercises', function(req, res){    
    User.findOne({ "_id" : req.params._id }, function(err, result){
        
        if (!result){
            res.json({ error: "Invalid Id" })
            return // id is invalid
        }
        
        //user exists
        let date = new Date()
        if(req.body.date)
            date = new Date(req.body.date)
        
        let exercise = new Exercise({
            uid: req.params._id,
            description: req.body.description,
            duration:  req.body.duration,
            date: +date
        })
    
        exercise.save(function(err, data){
            d = {
                "_id" : req.params._id,
                "username" : result['username'],
                "date" : date.toDateString(),
                "duration" : +req.body.duration,
                "description" : req.body.description
            }
            res.json(d)
        })
    })
})

app.get('/api/users/:_id/logs', function(req, res){
        console.log(req.originalUrl)
    console.log(req.query.from)
    console.log(req.query.to)
    console.log("----")
    
    
    User.findOne({ _id : req.params._id }, function(err, u_result){
        Exercise.find({ uid: req.params._id }, function(err, e_result){

            let exercises = []
            e_result.forEach(function(element){
                let e = {
                    description: element['description'],
                    duration: element['duration'],
                    date: new Date(element['date']).toDateString(),
                }

                if(req.query.from){
                        console.log("date: " + element['date'])
                        console.log("from: "+ +new Date(req.query.from))
                        console.log("to: "+ +new Date(req.query.to))
                    
                    
                    if(element['date'] >= +new Date(req.query.from) && element['date'] <= +new Date(req.query.to)){
                        console.log("posted")
                        exercises.push(e)
                    }
                }
                else{
                    exercises.push(e)
                }
            })

            let limit = exercises.length
            if(req.query.limit){
                limit = req.query.limit
            }
            
            d = {
              username: u_result['username'],
              count: exercises.length,
              _id: req.params._id,
              log: exercises.slice(0, limit)
            }

            res.json(d)
        })
   })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
