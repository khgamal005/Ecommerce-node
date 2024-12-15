const express = require("express");
const app = express();
require('dotenv').config()
const morgan = require('morgan');
const connectDB = require('./config/db')
const categoryModel = require("./model/categoryModel")




app.use(express.json());






if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`);
}


const getCategories = (req, res) => {
    const name = req.body.name;
    const price = req.body.price;
    console.log(req.body);

    const newCategory = new categoryModel({ name,price });
    newCategory
        .save()
        .then((doc) => {
            res.json(doc);
        })
        .catch((err) => {
            res.json(err);
        });
};

app.post("/", getCategories)



app.get("/",(req,res)=>{
    res.send("hi")
})









const PORT = process.env.PORT
connectDB().then(() => {

    app.listen(PORT, () => {
        console.log("Server is running " + PORT)
    })

})

