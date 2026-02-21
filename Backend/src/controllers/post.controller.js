const postModel = require("../models/post.model");
const ImageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs")
const jwt = require("jsonwebtoken");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

const createPostController = async (req,res)=>{
    console.log(req.body, req.file);

    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Token not provided, Unauthorized access"
        })
    }

    let decoded = null;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        return res.status(401).json({
            message:"user not authorized"
        })
    }



    const file = await imagekit.files.upload({
        file:await toFile(Buffer.from(req.file.buffer), 'file'),
        fileName:"Test",
        folder:"posts"
    })

    const post = await postModel.create({
        caption:req.body.caption,
        imgUrl:file.url,
        user:decoded.id
    })


    res.status(201).json({
        message:"Post created successfully",
        post
    })

    res.send(file);
}

const getPostController = async (req,res)=>{
    const token = req.cookies.token;
    let decoded = null;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        return res.status(401).json({
            message:"Token invalid"
        })
    }

    const userId = decoded.id;

    const posts = await postModel.find({
        user:userId
    })

    res.status(200).json({
        message:"post fetched successfully",
        posts
    })
}

const getPostDetailsController = async (req,res)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"Unauthorized access"
        })
    }

    let decoded;
    try{
        decoded = jwt.verify(token,process.env.JWT_SECRET);
    }catch(err){
        return res.status(401).json({
            message:"Invalid token"
        })
    }

    const userId = decoded.id;
    const postId = req.params.postId;
    const post = await postModel.findById(postId);

    if(!post){
        return res.status(404).json({
            message:"Post not found"
        })
    }

    const isVaildUser = post.user.toString() === userId;
    if(!isVaildUser){
        return res.status(403).json({
            message:"Forbidden Content"
        })
    }

    return res.status(200).json({
        message:"Post fetched successfully",
        post
    })

}


module.exports = {
    createPostController,
    getPostController,
    getPostDetailsController
}