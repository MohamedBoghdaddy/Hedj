import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv  from "dotenv"
import cors from "cors"
import emproute from "./routes/employeeroutes.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();


const PORT = process.env.PORT || 7000;
const URL =process.env.MONGOURL;

mongoose.connect(URL).then(()=>{

    console.log("db connected succesful");


    app.listen(PORT,()=>{
        console.log(`server is work on port: ${PORT}`);
    })

}).catch(error => console.log(error))


app.use('/api', emproute);