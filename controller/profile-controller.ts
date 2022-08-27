export {};
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const Profile = require('../models/profile.model.ts');

interface Profile {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
}

exports.registerUser = (req: any, res: any) => {
    console.log(req.body);
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
  
    // Check if all info is in request.
    if(!firstName || !lastName || !email || !password) {
      return res.status(400).json({msg: "There was either no First or Last Name, Email, or Password in the Request!"})
    }

    // Check and see if User already exists
    Profile.findOne(
        {email: email},
        (err: Error, profile: Profile) => {
            if(err) {
                return res.status(400).json({ 'msg': err });
            }
            if(profile) {
                return res.status(400).json({ 'msg': 'The user already exists with this email' });
            } else {
                // Create Profile Object
                let newProfile = Profile({
                    firstName,
                    lastName,
                    email,
                    password
                });
                // Save Object
                newProfile.save((err: Error, newProfile: Profile) => {
                    if (err) {
                        console.log(err)
                        return res.status(400).json({ 'msg': err });
                    }
                    if (!newProfile) {
                        console.log('There was no profile saved!')
                        return res.status(400).json({ msg: 'There was no profile saved!' });
                    }
                    console.log('Profile registered!');
                    return res.status(200).json(newProfile);
                    });
                }
            }
    )
}