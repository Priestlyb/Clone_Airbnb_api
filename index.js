const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const airbnbUser = require('./models/AirbnbUser.js');
const airbnbPlaces = require('./models/AirbnbPlace.js');
const AirbnbBooking = require('./models/AirbnbBooking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();
mongoose.set('strictQuery', false);

const app = express();
const PORT = process.env.PORT
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

/* Click connect at Database Deployments page */
mongoose.connect(
  process.env.MONGO_URL
          )
          .then(()=>console.log(`Connected to Datebase ${PORT}`))
          .then(() => {
              app.listen(process.env.PORT);
          }).catch((err) =>console.log(err));

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get('/test', (req,res) => {
  res.json('test ok');
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  argon2.hash(password).then(hashedPassword => {
    airbnbUser.create({
      name,
      email,
      password: hashedPassword,
    })
      .then(userDoc => {
        res.json(userDoc);
      })
      .catch(err => {
        console.log('Error during user creation:', err);
        res.status(422).json({ error: err.message });
      });
  }).catch(err => {
    console.log('Error during password hashing:', err);
    res.status(500).json({ error: 'Password hashing failed' });
  });
});


// console.log('JWT Secret:', process.env.JWT_SECRET);
// console.log('Mongo URL:', process.env.MONGO_URL);


app.post('/login', async (req,res) => {
  const {email,password} = req.body;
  const userDoc = await airbnbUser.findOne({email});
  if (userDoc) {
    const passOk = await argon2.verify(userDoc.password, password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token, {
          httpOnly: true,
          sameSite: 'lax', // or 'none' if using cross-site
          secure: true     // only if using HTTPS
        }).json(userDoc);
        
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) return res.status(401).json({ error: 'Invalid token' });

      const user = await airbnbUser.findById(userData.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { name, email, _id } = user;
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});


app.post('/logout', (req,res) => {
  res.cookie('token', '').json(true);
});