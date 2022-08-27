const mongoose                = require("mongoose");
const express                 = require("express");
const app                     = express();
const cors                    = require('cors');
const dotenv                  = require('dotenv');

// Configure Environment
dotenv.config();
console.log(process.env.DB_HOST_DEV);

// config and connect to mongodb
console.log('Connecting via Mongoose');
mongoose
  .connect(process.env.DB_HOST_DEV, {
    useNewUrlParser: true, useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.log(err))

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const contactUsRoute = require('./routes/contact-us.route');
const profileRoute = require('./routes/profile.route');

// API Routes
app.use("/contact-us", contactUsRoute);
app.use("/profile", profileRoute);
// Profile API

// Listen on PORT
const port = process.env.PORT || 3000;
app.listen(port, 
  () => {
    console.log(`Listening on port ${port}`)})    

export {}