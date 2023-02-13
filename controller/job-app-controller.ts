export {};
import { format } from 'date-fns'
const nodemailer = require('nodemailer')
const JobApp = require('../models/job-app.model');

// Sever side interface adds the date this user applied
// as 'dateApplied'.
interface newApp {
    job: String,
    availability: String,
    firstName: String,
    lastName: String,
    age: String,
    gender: String,
    phone: String,
    email: String,
    addressOne: String,
    addressTwo: String,
    city: String,
    state: String,
    zip: String,
    resume: String,
    goodFitReason: String,
    favoriteGames: String,
    strengthWeaknesses: String,
    dateApplied: Date,
  }

//   TODO: Send Email to user after success
exports.submitApp = (req: any, res: any ) => {
    console.log('Submittig Job Application ..');
    console.log(req.body);

    let newJobApp = JobApp({
        job: req.body.job,
        availability: new Date(req.body.availability).valueOf(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
        addressOne: req.body.addressOne,
        addressTwo: req.body.addressTwo,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        resume: req.body.resume,
        goodFitReason: req.body.goodFitReason,
        favoriteGames: req.body.favoriteGames,
        strengthWeaknesses: req.body.strengthWeaknesses,
        dateApplied: Date.now().valueOf(),
        // dateApplied: format(Date.now(), "MMMM do, yyyy"),
    })


    newJobApp.save((err: Error, savedJobApp: newApp) => {
        if (err) {
            console.log(err)
            return res.status(400).json({ msg: 'Backend Error', err});
        }
        if (!savedJobApp) {
            console.log('There was no job app saved!')
            return res.status(400).json({ msg: 'There was no job app saved!' });
        }
        // Set transport service which will send the emails
        var transporter =  nodemailer.createTransport({
          service: 'hotmail',
          auth: {
                user: 'admin@finalbossar.com',
                pass: process.env.PASS,
            },
            debug: true, // show debug output
            logger: true // log information in console
        });

        //  configuration for email details
        const userMailOptions = {
        from: 'admin@finalbossar.com', // sender address
        to: `${req.body.email}`, // list of receivers
        subject: `Final Boss Studios Application | ${req.body.job}`,
        html:  `
          <img src="https://final-boss-logos.s3.us-east-2.amazonaws.com/Final_Boss_Studios_Text_Logo_White_BG.png" style="width: 300px;">
          <h3 style="
            font-size: 1.4em;
            color: #330474;
          ">Thank you for applying for Final Boss Studios!</h3>
          <p style="font-size: 1em;">We will be looking over your application, and we will reach out to you soon. </p>`,
        };
        const adminMailOptions = {
        from: 'admin@finalbossar.com', // sender address
        to: `admin@finalbossar.com`, // list of receivers
        subject: `Final Boss Studios Application | ${req.body.job}`,
        html:  `
          <img src="https://final-boss-logos.s3.us-east-2.amazonaws.com/Final_Boss_Studios_Text_Logo_White_BG.png" style="width: 300px;">
          <h3 style="
            font-size: 1.4em;
            color: #330474;
          ">A user has applied for Final Boss Studios!</h3>
          <p style="font-size: 1em;">${req.body.firstName} ${req.body.lastName} | ${req.body.job}</p>
          <a href="https://finalbossar.com/fbs-admin">Please Visit FBS Admin to view App</a>
          `,
        };

        transporter.sendMail(userMailOptions, function (err: any, info: any) {
        if(err) {
          console.log(err)
          return res.status(400).json(err);
        }
        else {
          console.log(info);
          return res.status(200).json(info)
        }
        });

        transporter.sendMail(adminMailOptions, function (err: any, info: any) {
        if(err) {
          console.log(err)
          return res.status(400).json(err);
        }
        else {
          console.log(info);
          return res.status(200).json(info)
        }
        });

        return res.status(200).json({
            msg: 'Thank you, ' 
            + req.body.firstName 
            + ' ' 
            + req.body.lastName
            + ', for applying for Final Boss Studios. We appreciate your interest, and will get back to you as soon as we can!'

        });
    })

  }