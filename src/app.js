import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express(); 

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({    //json files acceptance size
    limit:"16kb",
}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))//this is used to get information through the url
app.use(express.static("public"))  //this is used to store immediate files directly on the server for temporary needs
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"

//routes defined
app.use("/api/v1/users",userRouter)

//http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/users/register
export {app}
