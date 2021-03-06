const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.MONGO_STRING.replace("<password>", process.env.PASSWORD);

const port = process.env.PORT || 3000;

mongoose.set("toJSON", {
    virtuals: true,
    transform: (doc, converted) => {
        delete converted._id;
    },
});
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("CONNECTED TO THE DATABSE");
        app.listen(port, () => {
            console.log("SERVER IS RUNNING");
        });
    })
    .catch((err) => console.log(err));
