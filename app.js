require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const {MongoStore} = require('connect-mongo');
const axios = require('axios');
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

app.get('/nosql-injection', (req,res) => {
    res.send(`
        noSQL injection example:
        <form action='/nosql-injection' method='post'>
            <input name='user' type='text' placeholder='user'>
            <button>Submit</button>
        </form>
        <div style='font-family:Helvetica, arial, sans-serif;'>
            You can use <a href="https://www.postman.com/">Postman <img src="Postman.png" style="height:45px;"/></a> to bypass this form page and perform a NoSQL injection attack.
            <br>
            <br>
            URL: <code>/nosql-injection</code> <br>
            Method: <code>POST</code> <br>
            Body (raw: JSON): <code> { "user": "name" } </code> <br>
            <em>(normal behaviour)</em> <br>
            <br>
            <strong>OR</strong> <br>
            <br>
            Body (raw: JSON): <code>{ "user": {"$ne": "name"} } </code><br>
            <em>(NoSQL injection attack)</em> <br>
            <img src="PostmanSS.png"/>
        </div>
        `)
});

app.post('/nosql-injection', async (req,res) => {
	var username = req.body.user;

	if (!username) {
		res.send(`<h3>no user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`);
		return;
	}
	console.log("user: "+username);

	const schema = Joi.string().max(20).required();
	const validationResult = schema.validate(username);

	//If we didn't use Joi to validate and check for a valid URL parameter below
	// we could run our userCollection.find and it would be possible to attack.
	// A URL parameter of user[$ne]=name would get executed as a MongoDB command
	// and may result in revealing information about all users or a successful
	// login without knowing the correct password.
	if (validationResult.error != null) {  
        console.log(validationResult.error);
        res.send("<h1 style='color:darkred;'>A NoSQL injection attack was detected!!</h1>");
        return;
	}	

	const result = await userCollection.find({username: username}).project({username: 1, password: 1, _id: 1}).toArray();

	console.log(result);

    res.send(`<h1>Hello ${username}</h1>`);
});

const signupSchema = Joi.object({
    username: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().max(50).required()
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().max(50).required()
});

// Routes
app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/signup', (req, res) => {
    res.render('pages/signup', {
        error: null
    });
});

app.post('/signup', async (req, res) => {

    const validation = signupSchema.validate(req.body);

    if (validation.error) {
        return res.render('pages/signup', {
            error: validation.error.details[0].message
        });
    }

    const { username, email, password } = req.body;

    const existingUser = await userCollection.findOne({ 
        $or: [
            {username},
            {email}
        ]
    });

if (existingUser) {
    return res.render('pages/signup', {
        error: 'Username or email already exists.'
    });
}

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({
        username,
        email,
        password: hashedPassword,
        user_type: 'user'
    });

    req.session.authenticated = true;
    req.session.name = username;
    req.session.user_type = 'user';

    res.redirect('/members');
});

app.get('/login', (req, res) => {
    res.render('pages/login', {
        error: null
    });
});

app.post('/login', async (req, res) => {

    const validation = loginSchema.validate(req.body);

    if (validation.error) {
        return res.render('pages/login', {
            error: validation.error.details[0].message
        });
    }

    const { username, password } = req.body;

    const user = await userCollection.findOne({ username });

    if (!user) {
        return res.render('pages/login', {
            error: 'Invalid username or password.'
        });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return res.render('pages/login', {
            error: 'Invalid username or password.'
        });
    }

    req.session.authenticated = true;
    req.session.name = user.username;
    req.session.user_type = user.user_type;

    res.redirect('/members');
});

app.get('/members', sessionValidation, async (req, res) => {

    let articles = [];

    try {
        const response = await axios.get(
            `https://newsapi.org/v2/top-headlines`,
            {
                params: {
                    category: 'sports',
                    country: 'us',
                    pageSize: 6,
                    apiKey: process.env.NEWS_API_KEY
                }
            }
        );

        articles = response.data.articles;
    }
    catch (err) {
        console.error(err);
    }

    res.render('pages/members', {
        authenticated: req.session.authenticated,
        user_type: req.session.user_type,
        name: req.session.name,
        articles
    });
});

app.get('/map', (req, res) => {
    res.render('pages/map')
})

app.get('/logout', (req, res) => {

    req.session.destroy();

    res.redirect('/');
});

app.use(express.static(__dirname + "/public"));

app.use((req,res) => {
	res.status(404);
	res.render('pages/404');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
