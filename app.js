if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path"); 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const dbURL = process.env.ATLASDB_URL;
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js"); 
const userRouter = require("./routes/user.js");



main()
    .then(() =>{
        console.log("connected to db");
    })
    .catch((err) =>{
        console.log(err);
    });
async function main() {
    await mongoose.connect(dbURL);
    }

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 3600,
    crypto: {
        secret:process.env.SECRET,
    }
});
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

// app.get("/",(req,res) =>{
//     res.send("Hi, i am root");
// });



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req,res) =>{
//     let fakeUser = new User({
//         username: "manish",
//         email: "lV5tK@example.com",
//     });
//     let registerUser = await User.register(fakeUser,"hello123");
//     res.send(registerUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.use ((err,req,res,next) =>{
     let { statusCode = 500, message = "Oh No, Something Went Wrong!" } = err;
      res.status(statusCode).render("error.ejs", {message, stickyFooter: true  });
      //res.status(statusCode).send(err.message); 

});

app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});
