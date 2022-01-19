const Post = require("../models/Post");
const User = require("../models/User");

const handleErrors = require("../util/handleErrors");

// CREATE POST
module.exports.create_post_post = async (req, res) => {
    const newPost = req.body;

    try {
        const post = await Post.create({
            name: newPost.name,
            breed: newPost.breed,
            description: newPost.description,
            location: newPost.location,
            userId: newPost.userId,
            type: newPost.type,
            image: newPost.imgFile,
        });

        res.status(200).json({
            post,
            message: "Post Created Successfully",
        });
    } catch (err) {
        handleErrors(err);
        res.status(404).json(err);
    }
};
// GET POST
module.exports.post_get = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        const targetUser = await User.findById(post.userId);

        res.status(200).json({
            post,
            user: {
                id: targetUser._id,
                email: targetUser.email,
                username: targetUser.username,
                name: targetUser.name,
                contact: targetUser.contact,
                location: targetUser.location,
                profileImg: targetUser.profileImg,
            },
        });
    } catch (err) {
        handleErrors(err);
        res.status(404).json(err);
    }
};
// EDIT POST
module.exports.edit_post_put = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body.data;

    const targetPost = await Post.findById(id);

    if (targetPost.userId === userId) {
        try {
            const post = await Post.findByIdAndUpdate(id, {
                $set: req.body.data.post,
            });
            res.status(200).json("Post Updated Successfully");
        } catch (err) {
            handleErrors(err);
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can only edit the pet you posted.");
    }
};
// DELETE POST
module.exports.post_delete = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body.data;

    const targetPost = await Post.findById(id);

    if (targetPost.userId === userId) {
        try {
            const post = await Post.findByIdAndDelete(id);
            res.status(200).json("Post Deleted Successfully");
        } catch (err) {
            handleErrors(err);
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can only delete the pet you posted.");
    }
};
// MISSING PET TIMELINE POST
module.exports.missing_post_timeline_get = async (req, res) => {
    try {
        const timelinePosts = await Post.find({ type: "missing" });
        res.status(200).json({
            posts: timelinePosts,
            message: "Missing posts retrieved successfully",
        });
    } catch (err) {
        handleErrors(err);
        res.status(500).json(err);
    }
};
// ADOPTION PET TIMELINE POST
module.exports.adoption_post_timeline_get = async (req, res) => {
    try {
        const timelinePosts = await Post.find({ type: "adoption" });
        res.status(200).json({
            posts: timelinePosts,
            message: "Adoption posts retrieved successfully",
        });
    } catch (err) {
        handleErrors(err);
        res.status(500).json(err);
    }
};
// MARK POST AS COMPLETED
module.exports.like_post_put = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.data.userId) {
            if (post.isCompleted) {
                await post.updateOne({ isCompleted: false });
                res.status(200).json("Post is now marked as not completed");
            } else {
                await post.updateOne({ isCompleted: true });
                res.status(200).json("Post is now marked as completed");
            }
        } else {
            res.status(403).json("You can only mark your own post");
        }
    } catch (err) {
        handleErrors(err);
        res.status(500).json(err);
    }
};
// GET POST BY USER
module.exports.all_posts_by_user_get = async (req, res) => {
    try {
        const userPosts = await Post.find({ userId: req.params.id });
        res.status(200).json({
            posts: userPosts,
            message: "user posts retrieved successfully",
        });
    } catch (err) {
        handleErrors(err);
        res.status(500).json(err);
    }
};

module.exports.all_posts_newsfeed_get = async (req, res) => {
    try {
        const allPosts = await Post.find({});
        res.status(200).json({
            posts: allPosts,
            message: "All posts retrieved successfully",
        });
    } catch (err) {}
};
