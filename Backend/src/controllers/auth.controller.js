const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const loginController = async (req,res)=>{
    const {username, email, password} = req.body;
    console.log(username,password);
    console.log(req.body);
    const user = await userModel.findOne({
        $or:[{username:username},
            {email:email}
        ]
    })

    console.log(user);

    if(!user){
        return res.status(409).json({
            message:"User not found"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Password invalid"
        })
    }

    const token = jwt.sign({
        id:user._id,
        username:user.username
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
    console.log(username,email,password,bio);
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

    const hash = await bcrypt.hash(password,10);

    const user = await userModel.create({
        username,
        email,
        password:hash,
        bio,
        profileImage
    })

    const token = jwt.sign({
        id:user._id,
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

const getMeController = async (req,res)=>{
    const userId = req.user.id;

    const user = await userModel.findById(userId);

    res.status(200).json({
        user:{
            username: user.username,
            email: user.email,
            bio: user.bio,
            profileImage: user.profileImage
        }
    })
}

module.exports ={
    loginController,
    registerController,
    getMeController
}