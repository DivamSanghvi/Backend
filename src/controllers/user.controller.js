import {asyncHandler} from '../utils/asyncHandlers.js' 
import {upload} from '../middlewares/multer.middleware.js'
import {ApiError} from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'

const generateAccessAndRefreshToken=async (userId)=>{
    try {
        const user=await User.findById(userId)
        
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        console.log(accessToken)

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})

        return {refreshToken,accessToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access or refresh token")
    }
}

const registerUser = asyncHandler ( async (req,res) => {
    //get user details from front end
    //check if the username email or something else is empty
    //check if the user exists
    //check for images/avatars and upload it on cloudinary
    //create user entry in database
    //remove password and refresh token field from the response
    //check for user creation 
    //return res

    const {fullname,email,username,password}=req.body
    console.log("email:", email);

    if([username,email,password,fullname].some((field)=>field?.trim()=="")){
        throw new ApiError(400,"all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"user with email or username already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    //const coverImageLocalPath=req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
} )

const loginUser = asyncHandler( async (req,res) => {
    //req->body for username password and email
    //check if the username exists
    //if exists check password validation
    //generate access and refresh token
    //send cookie
    const {email,username,password} = req.body
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    const isPasswordValid =await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"incorrect password")
    }
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure:true
    }

    //sending cookies
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        //this whole part is optional but a good practice 
        //this basically done if the user on frontend is asking for jwt for his own access
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            },
            
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out"))
})

export { registerUser, loginUser,logoutUser}

