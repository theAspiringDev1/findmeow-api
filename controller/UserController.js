const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const handleErrors = require("../util/handleErrors");
const { cloudinary } = require("../util/cloudinary");

const expiration = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, "findmeow", { expiresIn: expiration });
};

module.exports.signup_post = async (req, res) => {
    const data = req.body;

    try {
        const isExistingUser = await User.findOne({ email: data.email }).exec();
        if (!isExistingUser) {
            const user = await User.create({
                email: data.email,
                password: data.password,
                name: data.name,
                username: data.username,
                location: data.location,
                contact: data.contact,
                profileImg: data.profileImg,
            });

            const token = createToken(user._id);
            res.cookie("jwt", token, {
                domain: process.env.DOMAIN,
                maxAge: expiration * 1000,
            });

            res.status(201).json({
                userID: user._id,
                token,
                user: {
                    name: user.name,
                    username: user.username,
                    profileImg: user.image,
                    email: user.email,
                    location: user.location,
                    contact: user.contact,
                    profileImg: user.profileImg,
                },
            });
        } else {
            throw new Error("Email is already used.");
        }
    } catch (err) {
        handleErrors(err);
        res.status(404).json(err);
    }
};

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body.data;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, {
            domain: process.env.DOMAIN,
            maxAge: expiration * 1000,
        });
        res.status(201).json({ userID: user._id, token, user });
    } catch (err) {
        res.status(404).json({
            status: "404",
            message: "Check your password or create your account",
            error: err,
        });
    }
};

module.exports.user_get = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                contact: user.contact,
                location: user.location,
                profileImg: user.profileImg,
            },
        });
    } catch (err) {
        handleErrors(err);
        res.status(404).json(err);
    }
};

module.exports.user_delete = async (req, res) => {
    // CHECK IF THE USER IS DELETING THEIR OWN ACCOUNT
    const currentUser = req.body.currentUser;
    const targetUser = req.params.id;
    const profileID = req.body.publicID;
    if (currentUser === targetUser) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            const allPosts = await Post.find({ userId: currentUser });
            await cloudinary.uploader.destroy(profileID);
            allPosts.forEach(async (item) => {
                await cloudinary.uploader.destroy(item.image);
                await Post.findByIdAndDelete(item.id);
            });
            res.status(200).json("Account Deleted Successfully");
        } catch (err) {
            handleErrors(err);
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can only delete your own account");
    }
};

module.exports.user_put = async (req, res) => {
    console.log(req.body);
    const { editedProfile, prevPublicID: targetDeleteID } = req.body;

    // CHECK IF THE USER IS EDITING THEIR OWN ACCOUNT
    if (editedProfile.id === req.params.id) {
        if (editedProfile.password) {
            const salt = await bcrypt.genSalt();
            editedProfile.password = await bcrypt.hash(
                editedProfile.password,
                salt
            );
        }

        try {
            const cloudinaryResp = await cloudinary.uploader.destroy(
                targetDeleteID
            );
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: editedProfile,
            });
            console.log(user);
            res.status(200).json({
                message: "Account Updated Successfully",
                updatedUser: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    name: user.name,
                    contact: user.contact,
                    location: user.location,
                    profileImg: user.profileImg,
                },
            });
        } catch (err) {
            handleErrors(err);
            res.status(500).json(err);
        }
    } else {
        res.status(403).json({ message: "You can only edit your own account" });
    }
};
