const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");


const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        
        if (error) {
            let errMsg = error.details.map(el => el.message).join(',');
            throw new ExpressError(400, errMsg);
        } else{
            next();
        }

};

//index route
router.get("/", wrapAsync(async (req,res) =>{
    const allListing= await Listing.find({});
    res.render("listings/index",{allListing});
}));

//New route
router.get("/new", (req,res) =>{
    res.render("listings/new");
});

//show route
router.get("/:id", wrapAsync(async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show",{listing});
}));

//create route
router.post("/",validateListing, wrapAsync(async(req, res,next) => {
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
router.get("/:id/edit", wrapAsync(async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
}));

//update route
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
    
    const { id } = req.params;
    let listingData = req.body.listing;

    
    if (listingData.image) {
        listingData.image = { url: listingData.image, filename: "listingimage" };
    } else {
      
        delete listingData.image;
    }

    await Listing.findByIdAndUpdate(id, listingData);
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id", wrapAsync(async (req,res) =>{
    const {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


module.exports = router;