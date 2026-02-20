const userModel = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken")

const loginController = async (req,res)=>{
    const {username, email, password} = req.body;

    const user = await userModel.findOne({
        $or:[{username:username},
            {email:email}
        ]
    })

    if(!user){
        return res.status(409).json({
            message:"User not found"
        })
    }

    const hash = crypto.createHash('sha256').update(password).digest("hex");
    const isPasswordValid = hash === user.password;

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Password invalid"
        })
    }

    const token = jwt.sign({
        id:user._id
    }, process.env.JWT_SECRET, {expiresIn:"1d"});

    res.cookie("token", token);

    res.status(200).json({
        message:"User loggedIn successfully.",
        user:{
            username:user.username,
            email:user.email,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })

}

const registerController = async (req,res)=>{
    const {username,email,password,bio,profileImage} = req.body;
    const isUserExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isUserExists){
        return res.status(409).json({
            message:"User Already Exists"
        })
    }

    const hash = crypto.createHash('sha256').update(password).digest("hex");

    const user = await userModel.create({
        username,
        email,
        password:hash,
        bio,
        profileImage
    })

    const token = jwt.sign({
        id:user._id,
        email:user.email,
        username:user.username
    },process.env.JWT_SECRET, {expiresIn:'1d'});

    res.cookie("token", token);

    res.status(201).json({
        message:"User registered successfully",
        user:{
            email:user.email,
            username:user.username,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })

}

module.exports ={
    loginController,
    registerController
}