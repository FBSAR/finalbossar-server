export {};
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const jwt = require('jsonwebtoken');
const config = require('../config/default.json'); 
const bcrypt = require("bcrypt");
const Profile = require('../models/profile.model.ts');

interface Profile {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
}

interface Token {
  email: string,
  firstName: string,
  lastName: string,
}

exports.registerProfile = (req: any, res: any) => {
    console.log(req.body);
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
  
    // Check if all info is in request.
    if(!firstName || !lastName || !email || !password) {
      return res.status(400).json({msg: "There was either no First or Last Name, Email, or Password in the Request!"})
    }

    // Check and see if Profile already exists
    Profile.findOne(
        {email: email},
        (err: Error, profile: Profile) => {
            if(err) {
                return res.status(400).json({ 'msg': err });
            }
            if(profile) {
                return res.status(400).json({ 'msg': 'The Profile already exists with this email' });
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
exports.sendRegisterCode = (req: any, res: any) => {

  console.clear();
  console.log(req.body);

  let code = req.body.code;
  let email = req.body.email;

  if(!code || !email) {
    console.log('There was either no Code or Email in the Request!');
    return res.status(400).json({msg: "There was either no Code or Email in the Request!"})
  }

  // Set transport service which will send the emails
  var transporter =  nodemailer.createTransport({
    service: 'hotmail',
    auth: {
          user: 'eddie@finalbossar.com',
          pass: process.env.PASS,
      },
      debug: true, // show debug output
      logger: true // log information in console
  });

//  configuration for email details
 const mailOptions = {
  from: 'register@finalbossar.com', // sender address
  to: `${email}`, // list of receivers
  subject: 'FinalBossAR Registration Code',
  html:
  `
    <h1>FinalBoss AR</h1>
    <div style="width: 100px; height: 100px; background: lightgreen; text-align: center;">
      <p style="padding-top: 3em;">Logo</p>
    </div>
    <h3 style="
      font-size: 1.4em;
      color: #888;
    ">Here is your 4 digit code</h3>
    <p style="font-size: 1.4em;">Please use this code on the website to complete your registration: </p>
    
    <p style="
      background: #dedede;
      border-radius: 100px;
      border: 2px solid #3cf63c;
      width: 200px;
      color: #3cf63c;
      padding: 0.5em;
      text-align: center;
      font-size: 2em;
      letter-spacing: 11px;">${code}</p>`,
  };

 transporter.sendMail(mailOptions, function (err: any, info: any) {
  if(err) {
    console.log(err)
    return res.status(400).json(err);
  }
  else {
    console.log(info);
    return res.status(200).json(info)
  }
 });

}
/**
 * 
 * @param user
 * @returns JSON Web Token
 */
 function createToken(token: Token) {
  return jwt.sign(
    { 
      email: token.email, 
      firstName: token.firstName,
      lastName: token.lastName,
    }, config.jwtSecret, {
      expiresIn: 200 // 86400 expires in 24 hours
    });
}

exports.loginProfile = (req: any, res: any) => {
    console.log(req.body);
    let email = req.body.email;
    let password = req.body.password;
    let stayLoggedIn = req.body.stayLoggedIn;
  
    // Check if all info is in request.
    if(!email || !password) {
      return res.status(400).json({msg: "There was No Email or No Password in the Request!"})
    }


  
    Profile.findOne({ email: req.body.email }, (err: Error, profile: any) => {
        if (err) {
            return res.status(400).send({ 'msg': err });
        }
  
        if (!profile) {
            return res.status(400).json({ 'msg': 'The Profile does not exist' });
        }
  
        profile.comparePassword(req.body.password, (err: Error, isMatch: Boolean) => {
            if (isMatch && !err) {
                console.log(`isMatch = ${isMatch}`)
                console.log('Logged in as: ' + profile.email);

                if(stayLoggedIn) {
                  return res.status(200).json({
                      msg: 'Profile @' + profile.email + ' has logged in / Staying logged in.',
                      token: createToken(profile),
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      email: profile.email
                  });
                  
                } else {
                  return res.status(200).json({
                    msg: 'Profile @' + profile.email + ' has logged in.',
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email
                });
                };
            } else {
                return res.status(400).json({ msg: 'The email and password don\'t match.' });
            }
        });
    });

}

exports.changeName = (req: any, res: any ) => {
    console.log('Attempting to change Profile name...')
    console.log(req.body);
  
    let fullName = req.body.fullName;
    let email = req.body.email;
    let password = req.body.password;
    let filter = {email: email};
    let update = { fullName: fullName};

    if (!fullName || !password) {
        res.status(400).send('Needs name and a password')
    } else {
  
        console.log('Finding Profile ...')
        // Find Profile, compare password, then update email.
        Profile.findOne({ email: email}, (err: any, Profile: any) => {
          if (err) {
            return res.status(400).send({ 'msg': err });
          }
  
          if (!Profile) {
            return res.status(400).json({ 'msg': 'The Profile does not exist' });
          }
  
          if (Profile.fullName === fullName) {
            return res.status(400).send('Please enter an name that is different than your current one.');
          }
  
          console.log('Comparing passwords ...')
          Profile.comparePassword(password, (err: any, isMatch: any) => {
            if (isMatch && !err) {
              console.log('Passwords matched!');
              Profile.updateOne(filter, update)
              .then( (data: any) => {
                console.log('Updated FullName:' + JSON.stringify(data));
                return res.status(200).send(isMatch);
              })
              .catch( (err: any) => {
                console.log(err);
                return res.status(400).send(err);
              })
            } else {
              console.log('Wrong Password');
              return res.status(400).json({ msg: 'Wrong Password' });
            }
          })
        })
      }
}

exports.changeEmail = (req: any, res: any) => {
    console.log('Attempting to change Profile email...')
    console.log(req.body);
  
    let email = req.body.email;
    let newEmail = req.body.newEmail;
    let password = req.body.password;
    let filter = { email: email };
    let update = { email: newEmail};

    if (!email || !password) {
        res.status(400).send('Needs an email and a password')
    } else {
  
        console.log('Finding Profile ...')
        // Find Profile, compare password, then update email.
        Profile.findOne({ email: email}, (err: any, profile: any) => {
          if (err) {
            return res.status(400).send({ 'msg': err });
          }
  
          if (!profile) {
            return res.status(400).json({ 'msg': 'The Profile does not exist' });
          }
  
          if (profile.email === newEmail) {
            return res.status(400).send('Please enter an email that is different than your current one.');
          }
  
          console.log('Comparing passwords ...')
          Profile.comparePassword(password, (err: any, isMatch: any) => {
            if (isMatch && !err) {
              console.log('Passwords matched!');
              Profile.updateOne(email, update)
              .then( (data: any) => {
                console.log('Updated Email:' + JSON.stringify(data));
                return res.status(200).send(isMatch);
              })
              .catch( (err: any) => {
                console.log(err);
                return res.status(400).send(err);
              })
            } else {
              console.log('Wrong Password');
              return res.status(400).json({ msg: 'Wrong Password' });
            }
          })
        })
      }
}

exports.changePassword = (req: any, res: any ) => {
    console.log('Attempting to change Profile password...')
    console.log(req.body);
  
    let email = req.body.email;
    let newPassword = req.body.newPassword;
    let oldPassword = req.body.oldPassword;

    if (!email || !oldPassword) {
        res.status(400).send('Needs email and a password')
    } else {
  
        console.log('Finding Profile ...')
        // Find Profile, compare password, then update email.
        Profile.findOne({ email: email}, (err: any, Profile: any) => {
          if (err) {
            return res.status(400).send({ 'msg': err });
          }
  
          if (!Profile) {
            return res.status(400).json({ 'msg': 'The Profile does not exist' });
          }

  
          console.log('Comparing passwords ...')
          Profile.comparePassword(oldPassword, (err: any, isMatch: any) => {

            if (isMatch && !err) {
  
              // Create new hashed password
              bcrypt.genSalt(10, (err: any, salt: any) => {
  
                if (err) return (err);
  
                bcrypt.hash(newPassword, salt, (err: any, hash: string) => {
                  console.log('New Password Hashed: ' + hash);
                  let newPassword = hash;
                  let filter = { password: Profile.password };
                  let update = { password: newPassword }
  
                  Profile.updateOne(filter, update)
                    .then( (data: any) => {
                      console.log('Updated Password: ' + JSON.stringify(data));
                      res.status(200).send(isMatch);
                    })
                    .catch( (err: any) => {
                      console.log(err);
                      res.status(400).end('There was an error');
                    })
                  })
                })
            } else {
              console.log(isMatch);
              return res.status(200).send('Passwords do not match!');
            }
          })
        })
      }
}