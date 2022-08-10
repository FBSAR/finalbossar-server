const mongoose                = require("mongoose");
const express                 = require("express");
const app                     = express();
const cors                    = require('cors');
const dotenv                  = require('dotenv');

const contactUsRoute = require('./routes/contact-us.route');

// Configure Environment
// dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/contact-us", contactUsRoute);


// Listen on PORT
const port = process.env.PORT || 3000;
app.listen(port, 
  () => {
    console.log(`Listening on port ${port}`)})    

export {}