const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path"); 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js"); 
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");



main()
    .then(() =>{
        console.log("connected to db");
    })
    .catch((err) =>{
        console.log(err);
    });
async function main() {
    await mongoose.connect(MONGO_URL);
    }

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const sessionOptions = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.get("/",(req,res) =>{
    res.send("Hi, i am root");
});

app.use(session(sessionOptions));
app.use(flash());


app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


app.use("/listings", listings);
app.use("/listings/:id/reviews",reviews);

app.use ((err,req,res,next) =>{
     let { statusCode = 500, message = "Oh No, Something Went Wrong!" } = err;
      res.status(statusCode).render("error.ejs", {message, stickyFooter: true  });
      //res.status(statusCode).send(err.message); 

});

app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});
