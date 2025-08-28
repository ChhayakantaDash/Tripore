const express = require("express")
const app = express();
const mongoose = require("mongoose")
const Listing = require("./models/listing.js");
const path = require("path"); 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

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
//create route
app.post("/listings", async (req, res) => {
    // Manually construct the new listing object
    const newListing = new Listing(req.body.listing);

    // If no image URL is provided, use a default one
    let url = req.body.listing.image;
    if (!url) {
        url = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60";
    }

    // **This is the fix**: Set the image field to be an object
    newListing.image = {
        url: url,
        filename: "listingimage"
    };
    
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
//update route
app.put("/listings/:id", async (req, res) => {
    const { id } = req.params;
    let listingData = req.body.listing;

    // **This is the fix**: Check if a new image URL string was provided
    if (listingData.image) {
        // If yes, convert it back into the object format before updating
        listingData.image = { url: listingData.image, filename: "listingimage" };
    } else {
        // If the image field was left blank, remove it from the update data
        // to prevent it from overwriting the existing image with nothing.
        delete listingData.image;
    }

    await Listing.findByIdAndUpdate(id, listingData);
    res.redirect(`/listings/${id}`);
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