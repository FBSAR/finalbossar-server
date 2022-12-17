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
        return res.status(200).json({
            msg: 'Thank you, ' 
            + req.body.firstName 
            + ' ' 
            + req.body.lastName
            + ', for applying for Final Boss Studios. We appreciate your interest, and will get back to you as soon as we can!'

        });
    })

  }