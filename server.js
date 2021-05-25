const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;
const dotenv = require('dotenv');
dotenv.config();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(cors());
app.use(require('morgan')('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const utilsRoute = require('./routes/utils');
app.use('/utils', utilsRoute);

//db
async function connectDB() {
  await mongoose.connect("mongodb+srv://testUser:testPass@cluster0.neji0.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("db connected");
}
connectDB();

app.get('/', (req, res) => {
  res.send('Welcome to LocalPedia');
})

app.listen(process.env.PORT || port);