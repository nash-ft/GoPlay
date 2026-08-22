require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const axios = require("axios");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb")
const saltRounds = 12;

const app = express();

const Joi = require("joi");
const mongoSanitizer = require("mongo-sanitizer").default;

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

const client = require("./databaseConnection");

// Collections
const userCollection = client.db(mongodb_user_database).collection("users");

const favouritesCollection = client
  .db(mongodb_user_database)
  .collection("favourites");

const discussionsCollection = client
  .db(mongodb_user_database)
  .collection("discussions");

const repliesCollection = client
  .db(mongodb_user_database)
  .collection("replies");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(mongoSanitizer({ replaceWith: "_" }));

// Set up MongoDB session store
const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  dbName: mongodb_session_database,
  crypto: {
    secret: mongodb_session_secret,
  },
});

// Set up session middleware
app.use(
  session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: expireTime,
    },
  }),
);

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

function sessionValidation(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    res.redirect("/login");
  }
}

function getSportIcon(sport) {

    switch (sport.toLowerCase()) {

        case "soccer":
            return "⚽";

        case "basketball":
            return "🏀";

        case "tennis":
            return "🎾";

        case "baseball":
            return "⚾";

        case "volleyball":
            return "🏐";

        case "golf":
            return "⛳";

        case "swimming":
            return "🏊";

        case "running":
            return "🏃";

        default:
            return "🏅";
    }

}

app.get("/nosql-injection", (req, res) => {
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
        `);
});

app.post("/nosql-injection", async (req, res) => {
  var username = req.body.user;

  if (!username) {
    res.send(
      `<h3>no user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`,
    );
    return;
  }
  console.log("user: " + username);

  const schema = Joi.string().max(20).required();
  const validationResult = schema.validate(username);

  //If we didn't use Joi to validate and check for a valid URL parameter below
  // we could run our userCollection.find and it would be possible to attack.
  // A URL parameter of user[$ne]=name would get executed as a MongoDB command
  // and may result in revealing information about all users or a successful
  // login without knowing the correct password.
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.send(
      "<h1 style='color:darkred;'>A NoSQL injection attack was detected!!</h1>",
    );
    return;
  }

  const result = await userCollection
    .find({ username: username })
    .project({ username: 1, password: 1, _id: 1 })
    .toArray();

  console.log(result);

  res.send(`<h1>Hello ${username}</h1>`);
});

const signupSchema = Joi.object({
  username: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().max(50).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().max(50).required(),
});

const discussionSchema = Joi.object({
    title: Joi.string()
        .max(100)
        .required(),

    description: Joi.string()
        .max(1000)
        .required()
});

const replySchema = Joi.object({

    message: Joi.string()
        .max(1000)
        .required()

});

// Routes
app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/signup", (req, res) => {
  res.render("pages/signup", {
    error: null,
  });
});

app.post("/signup", async (req, res) => {
  const validation = signupSchema.validate(req.body);

  if (validation.error) {
    return res.render("pages/signup", {
      error: validation.error.details[0].message,
    });
  }

  const { username, email, password } = req.body;

  const existingUser = await userCollection.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res.render("pages/signup", {
      error: "Username or email already exists.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await userCollection.insertOne({
    username,
    email,
    password: hashedPassword,
    user_type: "user",
  });

  req.session.authenticated = true;
  req.session.userId = result.insertedId;
  req.session.name = username;
  req.session.user_type = "user";

  res.redirect("/members");
});

app.get("/login", (req, res) => {
  res.render("pages/login", {
    error: null,
  });
});

app.post("/login", async (req, res) => {
  const validation = loginSchema.validate(req.body);

  if (validation.error) {
    return res.render("pages/login", {
      error: validation.error.details[0].message,
    });
  }

  const { username, password } = req.body;

  const user = await userCollection.findOne({ username });

  if (!user) {
    return res.render("pages/login", {
      error: "Invalid username or password.",
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.render("pages/login", {
      error: "Invalid username or password.",
    });
  }

  req.session.authenticated = true;
  req.session.userId = user._id;
  req.session.name = user.username;
  req.session.user_type = user.user_type;

  res.redirect("/members");
});

app.get("/members", sessionValidation, async (req, res) => {
  let articles = [];

  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category: "sports",
        country: "us",
        pageSize: 6,
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    articles = response.data.articles;
  } catch (err) {
    console.error(err);
  }

  res.render("pages/members", {
    authenticated: req.session.authenticated,
    user_type: req.session.user_type,
    name: req.session.name,
    articles,
  });
});

app.get("/map", (req, res) => {
  res.render("pages/map");
});

// Saved page route
app.get("/saved", sessionValidation, async (req, res) => {

    const favourites = await favouritesCollection
        .find({
            userId: req.session.userId
        })
        .sort({ createdAt: -1 })
        .toArray();

    res.render("pages/saved", {
        favourites
    });

});

app.get("/api/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing search query." });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "json",
          limit: 5,
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "GoPlay/1.0",
        },
      },
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: "Search failed." });
  }
});

// Save favourite
app.post("/api/favourites", sessionValidation, async (req, res) => {
  try {
    const favourite = req.body;

    favourite.userId = req.session.userId;
    favourite.createdAt = new Date();

    const existing = await favouritesCollection.findOne({
      userId: favourite.userId,
      facilityId: favourite.facilityId,
    });

    if (existing) {
      return res.status(409).json({
        message: "Already saved.",
      });
    }

    await favouritesCollection.insertOne(favourite);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to save favourite.",
    });
  }
});

// Delete favourite
app.delete("/api/favourites/:facilityId", sessionValidation, async (req, res) => {

    await favouritesCollection.deleteOne({

        userId: req.session.userId,
        facilityId: req.params.facilityId

    });

    res.json({ success: true });

});

app.get("/discuss", sessionValidation, (req, res) => {

    const sports = [
    {
        name: "Soccer",
        icon: "⚽",
        description: "Discuss football leagues, players, and matches."
    },
    {
        name: "Basketball",
        icon: "🏀",
        description: "Talk about the NBA, EuroLeague, and more."
    },
    {
        name: "Tennis",
        icon: "🎾",
        description: "Discuss ATP, WTA, Grand Slams, and players."
    },
    {
        name: "Baseball",
        icon: "⚾",
        description: "Share MLB news and baseball discussions."
    },
    {
        name: "Volleyball",
        icon: "🏐",
        description: "Talk indoor and beach volleyball."
    },
    {
        name: "Golf",
        icon: "⛳",
        description: "Discuss courses, tournaments, and equipment."
    },
    {
        name: "Swimming",
        icon: "🏊",
        description: "Share swimming tips and competition news."
    },
    {
        name: "Running",
        icon: "🏃",
        description: "Discuss races, training, and gear."
    }
];

    res.render("pages/discuss", {
        sports
    });

});

app.get("/discuss/:sport", sessionValidation, async (req, res) => {

    const sport = {
        slug: req.params.sport,
        name:
            req.params.sport.charAt(0).toUpperCase() +
            req.params.sport.slice(1),
        icon: getSportIcon(req.params.sport)
    };

    const discussions = await discussionsCollection
        .find({
            sport: req.params.sport
        })
        .sort({
            createdAt: -1
        })
        .toArray();

    res.render("pages/sport", {

        sport,
        discussions

    });

});

app.get("/discuss/:sport/new", sessionValidation, (req, res) => {

    const sport = {
        slug: req.params.sport,
        name:
            req.params.sport.charAt(0).toUpperCase() +
            req.params.sport.slice(1),
        icon: getSportIcon(req.params.sport)
    };

    res.render("pages/newDiscussion", {
        sport,
        error: null
    });

});

app.post("/discuss/:sport/new", sessionValidation, async (req, res) => {

    const validation = discussionSchema.validate(req.body);

    if (validation.error) {

        return res.render("pages/newDiscussion", {
            sport: {
                slug: req.params.sport,
                name:
                    req.params.sport.charAt(0).toUpperCase() +
                    req.params.sport.slice(1),
                icon: getSportIcon(req.params.sport)
            },
            error: validation.error.details[0].message
        });

    }

    const discussion = {

        sport: req.params.sport,

        title: req.body.title,

        description: req.body.description,

        authorId: req.session.userId,

        authorName: req.session.name,

        createdAt: new Date(),

        replyCount: 0,

        likeCount: 0

    };

    await discussionsCollection.insertOne(discussion);

    res.redirect(`/discuss/${req.params.sport}`);

});

app.get("/discussion/:id", sessionValidation, async (req, res) => {

    try {

        const discussion = await discussionsCollection.findOne({

            _id: new ObjectId(req.params.id)

        });

        const replies = await repliesCollection
            .find({

                discussionId: discussion._id
            })
            .sort({

                createdAt: 1
            })
            .toArray();

        res.render("pages/discussion", {

            discussion,
            replies,
            userId: req.session.userId

        });

    }
    catch (error) {

        console.error(error);

        res.status(500).send("Something went wrong.");

    }

});

app.get("/discussion/:id/edit", sessionValidation, async (req, res) => {

    const discussion = await discussionsCollection.findOne({
        _id: new ObjectId(req.params.id)
    });

    if (!discussion) {
        return res.status(404).send("Discussion not found.");
    }

    // Only the author can edit
    if (discussion.authorId.toString() !== req.session.userId.toString()) {
        return res.status(403).send("Unauthorized.");
    }

    res.render("pages/editDiscussion", {
        discussion,
        error: null
    });

});

app.post("/discussion/:id/edit", sessionValidation, async (req, res) => {

    const validation = discussionSchema.validate(req.body);

    if (validation.error) {
        return res.status(400).send(
            validation.error.details[0].message
        );
    }

    const discussion = await discussionsCollection.findOne({
        _id: new ObjectId(req.params.id)
    });

    if (!discussion) {
        return res.status(404).send("Discussion not found.");
    }

    // Only the author can edit
    if (discussion.authorId.toString() !== req.session.userId.toString()) {
        return res.status(403).send("Unauthorized.");
    }

    await discussionsCollection.updateOne(
        { _id: discussion._id },
        {
            $set: {
                title: req.body.title,
                description: req.body.description
            }
        }
    );

    res.redirect(`/discussion/${discussion._id}`);
});


app.post("/discussion/:id/reply", sessionValidation, async (req, res) => {

    const validation = replySchema.validate(req.body);

    if (validation.error) {

        return res.status(400).send(validation.error.details[0].message);

    }

    const discussion = await discussionsCollection.findOne({

        _id: new ObjectId(req.params.id)

    });

    if (!discussion) {

        return res.status(404).send("Discussion not found.");

    }

    const reply = {

        discussionId: discussion._id,

        authorId: req.session.userId,

        authorName: req.session.name,

        message: req.body.message,

        createdAt: new Date()

    };

    await repliesCollection.insertOne(reply);

    await discussionsCollection.updateOne(

        { _id: discussion._id },

        {
            $inc: {
                replyCount: 1
            }
        }

    );

    res.redirect(`/discussion/${discussion._id}`);

});

app.get("/reply/:id/edit", sessionValidation, async (req, res) => {

    const reply = await repliesCollection.findOne({
        _id: new ObjectId(req.params.id)
    });

    if (!reply) {
        return res.status(404).send("Reply not found.");
    }

    // Only the author can edit
    if (reply.authorId.toString() !== req.session.userId.toString()) {
        return res.status(403).send("Unauthorized.");
    }

    res.render("pages/editReply", {
        reply,
        error: null
    });

});

app.post("/reply/:id/edit", sessionValidation, async (req, res) => {

    const validation = replySchema.validate(req.body);

    if (validation.error) {
        return res.status(400).send(
            validation.error.details[0].message
        );
    }

    const reply = await repliesCollection.findOne({
        _id: new ObjectId(req.params.id)
    });

    if (!reply) {
        return res.status(404).send("Reply not found.");
    }

    // Only the author can edit
    if (reply.authorId.toString() !== req.session.userId.toString()) {
        return res.status(403).send("Unauthorized.");
    }

    await repliesCollection.updateOne(
        { _id: reply._id },
        {
            $set: {
                message: req.body.message,
                editedAt: new Date()
            }
        }
    );

    res.redirect(`/discussion/${reply.discussionId}`);
});

app.post("/reply/:id/delete", sessionValidation, async (req, res) => {

    const reply = await repliesCollection.findOne({
        _id: new ObjectId(req.params.id)
    });

    if (!reply) {
        return res.status(404).send("Reply not found.");
    }

    // Only the author can delete
    if (reply.authorId.toString() !== req.session.userId.toString()) {
        return res.status(403).send("Unauthorized.");
    }

    await repliesCollection.deleteOne({
        _id: reply._id
    });

    // Decrease the discussion's reply count
    await discussionsCollection.updateOne(
        { _id: reply.discussionId },
        {
            $inc: {
                replyCount: -1
            }
        }
    );

    res.redirect(`/discussion/${reply.discussionId}`);
});

app.post("/discussion/:id/delete", sessionValidation, async (req, res) => {

    const discussion = await discussionsCollection.findOne({
        _id: new ObjectId(req.params.id)
    });

    if (!discussion) {
        return res.status(404).send("Discussion not found.");
    }

    // Only the author can delete
    if (discussion.authorId.toString() !== req.session.userId.toString()) {
        return res.status(403).send("Unauthorized.");
    }

    // Delete all replies
    await repliesCollection.deleteMany({
        discussionId: discussion._id
    });

    // Delete discussion
    await discussionsCollection.deleteOne({
        _id: discussion._id
    });

    res.redirect(`/discuss/${discussion.sport}`);
});

app.get("/logout", (req, res) => {
  req.session.destroy();

  res.redirect("/");
});

app.use(express.static(__dirname + "/public"));

app.use((req, res) => {
  res.status(404);
  res.render("pages/404");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
