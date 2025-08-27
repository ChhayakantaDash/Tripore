const express = require("express")
const app = express();
const mongoose = require("mongoose")
const Listing = require("./models/listing.js");
const path = require("path"); 
const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

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
app.use(methodOverride("_method"));

app.get("/",(req,res) =>{
    res.send("Hi, i am root");
});
//index route
app.get("/listings", async (req,res) =>{
    const allListing= await Listing.find({});
    res.render("listings/index",{allListing});
});

//New route
app.get("/listings/new", (req,res) =>{
    res.render("listings/new");
});

//show route
app.get("/listings/:id", async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show",{listing});
});

//create route
app.post("/listings", async (req,res) =>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});


//edit route
app.get("/listings/:id/edit", async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
});

//update route
app.put("/listings/:id", async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${listing._id}`);
});

//delete route
app.delete("/listings/:id", async (req,res) =>{
    const {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});




// app.get("/testListing", async(req,res) =>{
//     let sampleListing = new Listing({
//         title:"new villa",
//         description:"By the beach",
//         price:1200,
//         location:"goa",
//         country:"india"
//     });


//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });


app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});