const express= require("express");
const cors = require("cors");
const { JsonWebTokenError } = require("jsonwebtoken");
const jwt = require('jsonwebtoken');
const JWT_SECRET="hari om"
// const {users}=require('./dataStorage/UserData')
const app = express();

const users=[];


app.use(express.json());
app.use(cors("http://localhost:5173/*"));

app.post("/signup", (req, res)=> {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const phoneNumber = req.body.phoneNumber
    const dob = req.body.dob
    const age = req.body.age
    const gender = req.body.gender

    users.push({
        name :name,
        email :email,
        password :password,
        phoneNumber :phoneNumber,
        dob :dob,
        age :age,
        gender :gender
    })

    // we should check if a user with this gmail already exist , not implimented yet do it later
    res.json({
        message:"signed successfully "
    });

});

app.post("/signin", (req, res)=> {
    const email = req.body.email;
    const password = req.body.password;

    let foundUser = null;
        foundUser = users.find(user=>email===user.email&& password === user.password);

    if (!foundUser) {
        res.json({
            message: "Credentials incorrect"
        })
    } else {
        const token = jwt.sign({
            email: foundUser.email
        }, JWT_SECRET);
        res.header("jwt", token);
        res.json({
            token: token,
            userdata:foundUser
        })
        return;
    }
});
app.listen("3000",()=>{
    console.log("the server is running on 3000");
});




