const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

//reviews
//post Route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${listing._id}`);

}));

//delete review route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async(req,res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;