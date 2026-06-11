require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const {MongoStore} = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;


const app = express();

const Joi = require("joi");
const mongoSanitizer = require('mongo-sanitizer').default;

const port = process.env.PORT || 3000;
const expireTime = 1 * 60 * 60 * 1000; // 1 hour

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_user_database = process.env.MONGODB_USER_DATABASE;
const mongodb_session_database = process.env.MONGODB_SESSION_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

const client = require('./databaseConnection');
const userCollection = client.db(mongodb_user_database).collection('users');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(mongoSanitizer(
    { replaceWith: '_'}
));

// Set up MongoDB session store
const mongoStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: mongodb_session_database,
    crypto: {
        secret: mongodb_session_secret
    }
});

// Set up session middleware
app.use(session({ 
    secret: node_session_secret,
	store: mongoStore, //default is memory store 
	saveUninitialized: false, 
	resave: false,
    cookie: {
        maxAge: expireTime
    }
}));

app.use((req, res, next) => {
    res.locals.authenticated = req.session.authenticated;
    res.locals.user_type = req.session.user_type;
    res.locals.name = req.session.name;
    next();
});

function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

function sessionValidation(req,res,next) {
    if (isValidSession(req)) {
        next();
    }
    else {
        res.redirect('/login');
    }
}


// Routes
app.get('/', (req, res) => {
  res.render('pages/index');
});

app.use(express.static(__dirname + "/public"));

app.use((req,res) => {
	res.status(404);
	res.send("404: File Not Found");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
