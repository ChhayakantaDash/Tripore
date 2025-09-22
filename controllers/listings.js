const Listing = require("../models/listing.js");
module.exports.index = async (req, res) => {
    //index route
    const allListing= await Listing.find({});
    res.render("listings/index.ejs",{allListing});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    
        const {id} = req.params;
        const listing = await Listing.findById(id)
        .populate({
            path:"reviews",
            populate:{
                path:"author"
            }
        })
        .populate("owner");
        if(!listing){
            req.flash("error", "Cannot find that listing!");
            return res.redirect("/listings");
        }
        res.render("listings/show",{listing});
};

module.exports.createListing = async (req, res) => {
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
    
        
    };

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
        const listing = await Listing.findById(id);
        if(!listing){
            req.flash("error", "Cannot find that listing!");
            return res.redirect("/listings");
        }
        res.render("listings/edit",{listing});
    };

module.exports.updateListing = async (req, res) => {
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
    };


module.exports.destroyListing = async (req, res) => {
    const {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Successfully deleted listing!");
    res.redirect("/listings");
};