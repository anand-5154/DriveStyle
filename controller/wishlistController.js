const wishlistCollection = require("../models/wishlistModel.js");
const productCollection = require("../models/productModel.js");
const cartCollection = require("../models/cartModel.js");

// Get Wishlist - Populate productId to get product details
const getWishlist = async (req, res) => {
    try {
        const wishlistData = await wishlistCollection
            .find({ userId: req.session?.currentUser?._id })
            .populate("items.productId");  // Populate items' product details using productId field

        console.log(wishlistData);  // Log the wishlist data to check if productId is populated

        res.render("userViews/wishlist", {
            user: req.session.user,
            currentUser: req.session.currentUser,
            wishlistData,
        });
    } catch (error) {
        console.error("Error in getWishlist:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Add Product to Wishlist
const addToWishlist = async (req, res) => {
    try {
        const existingItem = await wishlistCollection.findOne({
            userId: req.session.currentUser._id,
            "items.productId": req.params.id, // Check if the product is already in wishlist
        });

        if (!existingItem) {
            // If the product isn't already in the wishlist, push the productId to the wishlist
            await wishlistCollection.findOneAndUpdate(
                { userId: req.session.currentUser._id },
                { $push: { items: { productId: req.params.id } } }, // Corrected to use productId
                { upsert: true } // Create a wishlist if it doesn't exist
            );
        }

        res.redirect("back");
    } catch (error) {
        console.error("Error in addToWishlist:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Remove Product from Wishlist
const removeFromWishlist = async (req, res) => {
    try {
        // Remove item from wishlist based on productId
        await wishlistCollection.findOneAndUpdate(
            { userId: req.session.currentUser._id },
            { $pull: { items: { productId: req.params.id } } }  // Corrected to use productId
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Error in removeFromWishlist:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Move Product to Cart
const moveToCart = async (req, res) => {
    try {
        const wishlistItem = await wishlistCollection.findOne({
            userId: req.session.currentUser._id,
            "items.productId": req.params.id, // Find the wishlist item by productId
        });

        if (wishlistItem) {
            // Check if the product is already in the cart
            const existingCartItem = await cartCollection.findOne({
                userId: req.session.currentUser._id,
                productId: req.params.id, // Check if the product is in the cart
            });

            if (!existingCartItem) {
                // If the product isn't in the cart, create a new cart item
                await cartCollection.create({
                    userId: req.session.currentUser._id,
                    productId: req.params.id,
                    productQuantity: 1,
                });
            } else {
                // If the product is already in the cart, increment the quantity by 1
                await cartCollection.updateOne(
                    { _id: existingCartItem._id },
                    { $inc: { productQuantity: 1 } }
                );
            }

            // Remove the product from the wishlist after moving to the cart
            await wishlistCollection.findOneAndUpdate(
                { userId: req.session.currentUser._id },
                { $pull: { items: { productId: req.params.id } } }  // Remove from wishlist
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error in moveToCart:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
};
