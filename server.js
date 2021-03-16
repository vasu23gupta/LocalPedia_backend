const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
//var multer  = require('multer')
const app = express();
const port = 3000;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
//app.use(multer({dest:'./uploads/'}).single('singleInputFileName'));
// app.use(multer({ dest: './uploads/',
//   rename: function (fieldname, filename) {
//     return filename;
//   },
//  }));

//import routes
const vendorsRoute = require('./routes/vendors');
app.use('/vendors', vendorsRoute);

const imagesRoute = require('./routes/images');
app.use('/images', imagesRoute);

const reviewRoute = require('./routes/reviews');
app.use('/reviews', reviewRoute);

const reportRoute = require('./routes/reports');
app.use('/reports', reportRoute);

const usersRoute = require('./routes/users');
app.use('/users', usersRoute);

//db
async function connectDB(){
    await mongoose.connect("mongodb+srv://testUser:testPass@cluster0.neji0.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("db connected");
}
connectDB();

app.get('/', (req, res) => {
  res.send('Welcome to test_proj');
})

app.listen(port);