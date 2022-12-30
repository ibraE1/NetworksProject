const cookieParser = require("cookie-parser");
const express = require("express");
const session = require("express-session");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;

const app = express();

// Port number
const PORT = process.env.PORT || 3000;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(cookieParser());

// variables
const searchList = ["annapurna", "bali", "inca", "paris", "rome", "santorini"];
let loginData = "none";
let registrationData = "none";
let locationData = "none";
let searchData = [];
let myCollection;

// mongodb connection setup
MongoClient.connect("mongodb://127.0.0.1:27017", (err, database) => {
  if (err) return console.error(err);
  myCollection = database.db("myDB").collection("myCollection");
  console.log("Connected to database..");
});

// GET requests
app.get("/", (req, res) => {
  res.render("login", { loginData });
  return (loginData = "none");
});

app.get("/registration", (req, res) => {
  res.render("registration", { registrationData });
  return (registrationData = "none");
});

app.get("/home", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    return res.render("home");
  }
});

app.get("/hiking", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else return res.render("hiking");
});

app.get("/cities", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else return res.render("cities");
});

app.get("/islands", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else return res.render("islands");
});

app.get("/wanttogo", async (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    const user = await myCollection.findOne({ username: req.session.username });
    const userLocations = await user.locations;
    return res.render("wanttogo", { userLocations });
  }
});

app.get("/inca", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    res.render("inca", { locationData });
    return (locationData = "none");
  }
});

app.get("/bali", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    res.render("bali", { locationData });
    return (locationData = "none");
  }
});

app.get("/annapurna", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    res.render("annapurna", { locationData });
    return (locationData = "none");
  }
});

app.get("/rome", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    res.render("rome", { locationData });
    return (locationData = "none");
  }
});

app.get("/paris", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    res.render("paris", { locationData });
    return (locationData = "none");
  }
});

app.get("/santorini", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    res.render("santorini", { locationData });
    return (locationData = "none");
  }
});

app.get("/searchresults", (req, res) => {
  if (!req.session.loggedIn) {
    res.send("Please login first.");
  } else {
    res.render("searchresults", { searchData });
    return (searchData = []);
  }
});

// POST requests
app.post("/", async (req, res) => {
  /*  const arr = await myCollection.find().toArray();
  let flag = false;
  arr.forEach(async (document) => {
    if (
      document.username == req.body.username &&
      document.password == req.body.password
    ) {
      req.session.username = req.body.username;
      req.session.loggedIn = true;
      flag = true;
      return res.redirect("/home");
    }
  });
  if (!flag) {
    loginData = "invalid";
    return res.redirect("/");
  } */
  if (req.body.username == "admin" && req.body.password == "admin") {
    req.session.username = req.body.username;
    req.session.loggedIn = true;
    return res.redirect("/home");
  } else {
    loginData = "invalid";
    return res.redirect("/");
  }
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const arr = await myCollection.find().toArray();
  if (username == "" || password == "") {
    registrationData = "empty";
    return res.redirect("/registration");
  }
  let flag = false;
  arr.forEach((document) => {
    if (document.username == username) {
      flag = true;
      registrationData = "taken";
      return res.redirect("/registration");
    }
  });
  if (!flag) {
    myCollection.insertOne(
      {
        username: username,
        password: password,
        locations: [],
      },
      (err, res) => {
        console.log("1 user inserted");
      }
    );
    loginData = "successful";
    return res.redirect("/");
  }
});

app.post("/addtolist", async (req, res) => {
  const location = req.body.location;
  const user = await myCollection.findOne({ username: req.session.username });
  const userLocations = await user.locations;
  if (userLocations.includes(location)) {
    locationData = "duplicate";
  } else {
    userLocations.push(location);
    myCollection.updateOne(
      { username: req.session.username },
      {
        $set: {
          locations: userLocations,
        },
      },
      (err, res) => {
        console.log("1 document updated");
      }
    );
  }
  return res.redirect("/" + req.body.location);
});

app.post("/search", (req, res) => {
  const searchQuery = req.body.Search;
  searchList.forEach((item) => {
    if (item.includes(searchQuery)) {
      searchData.push(item);
    }
  });
  return res.redirect("/searchresults");
});

// set port number
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}..`);
});
