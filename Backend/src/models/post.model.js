const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        default:""
    },
    imgUrl:{
        type:String,
        required:[true, "ImageUrl is required to create the post"]
    },
    user:{
        ref:"users",
        type:mongoose.Schema.Types.ObjectId,
        required:[true, "User id is required for creating the post"]
    }
})

const postModel = mongoose.model("posts",postSchema);

module.exports = postModel;