const mongoose                = require("mongoose");
const express                 = require("express");
const app                     = express();
const cors                    = require('cors');
const dotenv                  = require('dotenv');
// const https                   = require('https');
// const fs                      = require('fs');

// HTTPS Config
// const options = {
//   key: fs.readFileSync('./192.168.0.169-key.pem'), // Replace with the path to your key
//   cert: fs.readFileSync('./192.168.0.169.pem') // Replace with the path to your certificate
// }

// Configure Environment
dotenv.config();

// Connect to mongodb
console.log('Connecting via Mongoose');
console.log(process.env.DB_HOST_PROD);
mongoose
  .connect(process.env.DB_HOST_PROD, {
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
const adminRoute = require('./routes/admin.route');
const webThreeRoute = require('./routes/web3.route');
const jobAppRoute = require('./routes/job-app.route');
const resumeRoute = require('./routes/resume.route');

// API Routes
app.use("/api/contact-us", contactUsRoute);
app.use("/api/profile", profileRoute);
app.use("/api/ad", adminRoute);
app.use("/api/job-app", jobAppRoute);
app.use("/api/web3", webThreeRoute);
app.use("/api/resume", resumeRoute);
 

// Listen on PORT
const port = process.env.PORT || 3000;
app.listen(port, 
  () => {
    console.log(`Listening on port ${port}`)
  });

// HTTPS
// app.use((req: any, res: any, next: any) => {
//   res.send('<h1>HTTPS Works!</h1>');
// });

// https.createServer(options, app).listen(port,() => {
//   console.log('HTTPS Server listening on port ' + port);
// });

  

export {}
