const express = require("express")
const app = express();
const mongoose = require("mongoose")
const Listing = require("./models/listing.js");
const path = require("path"); 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const { listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js")


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



app.get("/",(req,res) =>{
    res.send("Hi, i am root");
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        
        if (error) {
            let errMsg = error.details.map(el => el.message).join(',');
            throw new ExpressError(400, errMsg);
        } else{
            next();
        }

};

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
        
        if (error) {
            let errMsg = error.details.map(el => el.message).join(',');
            throw new ExpressError(400, errMsg);
        } else{
            next();
        }

    };



//index route
app.get("/listings", wrapAsync(async (req,res) =>{
    const allListing= await Listing.find({});
    res.render("listings/index",{allListing});
}));

//New route
app.get("/listings/new", (req,res) =>{
    res.render("listings/new");
});

//show route
app.get("/listings/:id", wrapAsync(async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show",{listing});
}));

//create route

app.post("/listings",validateListing, wrapAsync(async(req, res,next) => {
     if (!req.body.listing || Object.keys(req.body.listing).length === 0) {
        throw new ExpressError(400, "Invalid Listing Data: Please send listing details.");
    }
    
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

    
}));


//edit route
app.get("/listings/:id/edit", wrapAsync(async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
}));

//update route

app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
    
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
}));

//delete route
app.delete("/listings/:id", wrapAsync(async (req,res) =>{
    const {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//reviews
//post Route
app.post("/listings/:id/reviews",validateReview ,wrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);

}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));


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


app.use ((err,req,res,next) =>{
     let { statusCode = 500, message = "Oh No, Something Went Wrong!" } = err;
      res.status(statusCode).render("error.ejs", {message, stickyFooter: true  });
      //res.status(statusCode).send(err.message); 

});




app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});
