import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv  from "dotenv"
import cors from "cors"
import session from 'express-session';
import emproute from "./routes/employeeroutes.js";

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', // React app's address
    credentials: true,
  }));
  
  app.use(session({
    secret: 'yourSecretKey', // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using https
  }));
  
dotenv.config();


const PORT = process.env.PORT || 8080;
const URL =process.env.MONGOURL;

mongoose.connect(URL).then(()=>{

    console.log("db connected succesful");


    app.listen(PORT,()=>{
        console.log(`server is work on port: ${PORT}`);
    })

}).catch(error => console.log(error))


app.use('/api', emproute);