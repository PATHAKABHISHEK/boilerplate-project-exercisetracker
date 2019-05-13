const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ExcerciseTrackerDB', 
                 {useMongoClient : true},             
                  (err, doc) =>{
                      if(err){
                          console.log(err);
                      }else{
                          console.log("MongoDB Successfull Connection");
  }
});
const userSchema = mongoose.Schema({
  username : {
    type:String,
    required:true
  },
  description: {
    type: String
  },
  duration : {
    type: String
  },
  date : {
    type: Date
  }
});

var User = mongoose.model('User',userSchema);


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/exercise/new-user', (req, res) => {
  const user = new User();
  user.username = req.body.username;
  res.json({"username" : user.username, "_id" : user._id});
  user.save();
});

app.post('/api/exercise/add', (req, res) => {
    User.findByIdAndUpdate({'_id' : req.body.userId}, {$set:{
                                              'description': req.body.description,
                                              'duration' : req.body.duration,
                                              'date' : new Date(req.body.date)
                                                  }
                                            },
                                            
    ); 
    User.find({'_id' : req.body.userId}, (err,doc) => {
      if(err){
        console.log(err);
      }
     const my_username = doc[0].username;
     res.send({'username' : my_username, 'description' : req.body.description,
    'duration' : req.body.duration, '_id' : req.body.userId,
    'date' : req.body.date});
    });
       
                                                                    
});
                                            
                                              
                          
app.get('/api/exercise/log', (req, res) => {
  User.find({'_id' : req.query.userId}, (err, result) =>{
    if(err){
      console.log(err);
    }
    res.send(result[0]);
  });
});                                            
                                      
                      
                            


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})



// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
