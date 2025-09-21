const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner , validateListing} = require("../middleware.js");

//index route
router.get("/", wrapAsync(async (req,res) =>{
    const allListing= await Listing.find({});
    res.render("listings/index",{allListing});
}));

//New route
router.get("/new", isLoggedIn, (req,res) =>{
    res.render("listings/new");
});

//show route
router.get("/:id", wrapAsync(async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id)
    .populate("reviews")
    .populate("owner");
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
}));

//create route
router.post("/",validateListing,isLoggedIn, wrapAsync(async(req, res,next) => {
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
    newListing.owner = req.user._id;
    
    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect("/listings");

    
}));


//edit route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("listings/edit",{listing});
}));

//update route
router.put("/:id",
    
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
    
    const { id } = req.params;
    let listingData = req.body.listing;
    if (listingData.image) {
        listingData.image = { url: listingData.image, filename: "listingimage" };
    } else {
      
        delete listingData.image;
    }

    await Listing.findByIdAndUpdate(id, listingData);
    req.flash("success", "Successfully updated listing!");
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id",
    isLoggedIn,
    isOwner,
     wrapAsync(async (req,res) =>{
    const {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Successfully deleted listing!");
    res.redirect("/listings");
}));


module.exports = router;