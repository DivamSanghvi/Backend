import mongoose, { Mongoose, Schema, model } from "mongoose"
import { asyncHandler } from "../utils/asyncHandlers.js"
import { User } from "./user.model.js"
import { ApiError } from "../utils/ApiErrors"

const subscriptionSchema = new Schema({
    subscriber :{
        type: Schema.Types.ObjectId, //one who is subscribing
        ref: "User"
    },
    channel :{
        type: Schema.Types.ObjectId, //one to whom a 'subscriber' is subscribing
        ref:"User"
    }
},{timestamps: true})



export const Subscription = mongoose.model("Subscription",subscriptionSchema)