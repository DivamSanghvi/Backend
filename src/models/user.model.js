import { Schema } from "mongoose"
import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
        fullname:{
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps:true
    }
)
//bcrypt function is to encrypt the password
userSchema.pre("save", async function () {
    if(!this.isModified(this.password)) return;  //isModified helps us to see if any field is modified
    this.password=bcrypt.hash(this.password,10);   //here 10 is the amount of time hashing would be done
    next();                                         //the flag is passed next
})

//there are many methods in mongoose but to add one we have to do it as follows
userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,         //sirf id daala toh bhi kaam ho jaata hai
            email: this.email,     
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,   //the secret key goes here
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY  //the expiry time goes here
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);