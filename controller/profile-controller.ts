export {};
import { format } from 'date-fns'
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const jwt = require('jsonwebtoken');
const config = require('../config/default.json'); 
const bcrypt = require("bcrypt");
const Profile = require('../models/profile.model.ts');
const Wallets = require('../models/wallets.model.ts');
import { Network, Alchemy, Contract, Wallet } from 'alchemy-sdk';
require('dotenv').config();

const abi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint)",
  "function decimals() view returns (uint8)",
  "function name() public view returns (string)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

const alchemy_key = String(process.env.ALCHEMY_API_KEY);
const metaMaskPrivateKey = String(process.env.MM_PRIVATE_KEY);
const contractAddress = String(process.env.BOSSCOIN_CONTRACT_ADD);
const testAccount = String(process.env.MM_TEST_ACCOUNT);
const settings = {
  apiKey: String(alchemy_key),
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

interface Profile {
    firstName: string,
    lastName: string,
    email: string,
    walletAddress?: string,
    password: string,
}

interface UserWallet {
    email: string,
    walletAddress: string
}

interface Token {
  firstName: string,
  lastName: string,
  email: string,
  walletAddress: string,
}

exports.registerProfile = (req: any, res: any) => {
    console.log('Registering Profile');
    console.log(req.body);
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let newsletter = req.body.newsletter;
    let email = req.body.email;
    let password = req.body.password;
    // Wallet address will be valid when BOSSC promotion starts.
    let walletAddress = req.body.walletAddress;
    let dateRegistered = format(Date.now(), "MMMM do, yyyy");
  
    // Check if all info is in request.
    if(!firstName || !lastName || !email || !password) {
      return res.status(400).json({msg: "There was either no First or Last Name, Email, or Password in the Request!"})
    }

    Profile.findOne(
      {walletAddress: walletAddress},
      (err: Error, profile: Profile) => {
        if(err) {
          return res.status(400).json({ 'msg': err });
        }
        if(profile) {
            // console.log(profile);
            console.log('Profile Found upon registration with request\'s wallet address.');
            return res.status(400).json({ msg: 'A Profile already exists with this wallet address.' });
        }
        else {
          if(!walletAddress) {
            // Create Profile Object without a wallet address
            let newProfile = Profile({
              firstName,
              lastName,
              email,
              dateRegistered,
              newsletter,
              password
            });

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
              }
          );

          }

          Wallets.findOne(
                {walletAddress: walletAddress},
                (err: Error, wallet: UserWallet) => {
                  if (err) {
                    console.log(err)
                    return res.status(400).json({ 'msg': err });
                  }
                  if (wallet) {
                      console.log('There was an wallet address found with this address. No BOSSC Transaction will occur.')
                      return res.status(400).json({ msg: 'Wallet has already been used for Free BOSSC.' });
                  }

                  if(!wallet) {
                    // Save wallet address and email to Wallets Collection
                    let newWallet = Wallets({
                      walletAddress: walletAddress,
                      email: email
                    });
            
                    // Create Profile Object
                    let newProfile = Profile({
                      firstName,
                      lastName,
                      email,
                      dateRegistered,
                      newsletter,
                      walletAddress,
                      password
                    });

                    newWallet.save(async (err: Error, newWallet: UserWallet) => {
                      if (err) {
                        console.log(err)
                        return res.status(400).json({ 'msg': err });
                      }
                      if (!newWallet) {
                          console.log('There was no wallet saved!')
                          return res.status(400).json({ msg: 'There was no wallet saved!' });
                      }
                      if(newWallet) {
                        console.log('Wallet saved!');
                    
                        let provider = await alchemy.config.getProvider();
                        let wallet = new Wallet(metaMaskPrivateKey, provider);
                        let BossCoinContract = new Contract(contractAddress, abi, wallet);
                        await BossCoinContract.transfer(walletAddress, 100);
                        console.log('Sent user 100 BOSSC!');
                        return res.status(200).json({msg: "Profile registered, 100 BOSSC Sent to their address"});
                      }
                    })

                    newProfile.save( async (err: Error, newProfile: Profile) => {
                      if (err) {
                          console.log(err)
                          return res.status(400).json({ 'msg': err });
                      }
                      if (!newProfile) {
                          console.log('There was no profile saved!')
                          return res.status(400).json({ msg: 'There was no profile saved!' });
                      }
                    }
                  );
                  }
              }
          );
      } 
      }
    );
}

exports.sendRegisterCode = (req: any, res: any) => {
  console.clear();
  console.log('Sending Registration Code');
  console.log(req.body);

  let code = req.body.code;
  let email = req.body.email;

  if(!code || !email) {
    console.log('There was either no Code or Email in the Request!');
    return res.status(400).json({msg: "There was either no Code or Email in the Request!"})
  }

  // Check and see if Profile already exists
  Profile.findOne(
    {email: email},
    async (err: Error, profile: Profile) => {
        if(err) {
            return res.status(400).json({ 'msg': err });
        }
        if(profile) {
            // console.log(profile);
            console.log('Profile Found upon registration with request\'s email.');
            return res.status(400).json({ msg: 'A Profile already exists with this email' });
        } else {
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
            const mailOptions = {
            from: 'register@finalbossar.com', // sender address
            to: `${email}`, // list of receivers
            subject: 'FinalBossAR Registration Code',
            html:  `
              <img src="https://final-boss-logos.s3.us-east-2.amazonaws.com/Final_Boss_Studios_Text_Logo_White_BG.png" style="width: 300px;">
              <h3 style="
                font-size: 1.4em;
                color: #888;
              ">Here is your 4 digit code</h3>
              <p style="font-size: 1.4em;">Please use this code on the website to complete your registration: </p>
              
              <p style="
                background: #330474;
                border-radius: 100px;
                width: 200px;
                color: #fff;
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
        }
  )
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
      walletAddress: token.walletAddress,
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
                      email: profile.email,
                      walletAddress: profile.walletAddress
                  });
                  
                } else {
                  return res.status(200).json({
                    msg: 'Profile @' + profile.email + ' has logged in.',
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    walletAddress: profile.walletAddress
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
  
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;

    if (!password) {
        res.status(400).send('Needs a password')
    } else {
  
        console.log('Finding Profile ...')
        // Find Profile, compare password, then update email.
        Profile.findOne({ email: email}, (err: any, profile: any) => {

          let filter = {email: email};
          let update = { 
            firstName: firstName,
            lastName: lastName,

          };

          if (err) return res.status(400).send({ 'msg': err });
          if (!profile) return res.status(400).json({ msg: 'The Profile does not exist' });
          if (profile.firstName == '' ) update.firstName = profile.firstName;
          if (profile.lastName == '' ) update.lastName = profile.lastName;
          
          console.log('Comparing passwords ...')
          profile.comparePassword(password, (err: any, isMatch: any) => {
            if (isMatch && !err) {
              console.log('Passwords matched!');
              
              // Update Name
              Profile.updateOne(filter, update)
              .then( (data: any) => {
                console.log('Updated FullName:' + JSON.stringify(data));
                return res.status(200).json({
                  firstName,
                  lastName
                });
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

    if (!newEmail) {
        console.log('No Email!');
        return res.status(400).send('Request needs an email');
    } 
    
    if(!password) {
      console.log('No Password!');
      return res.status(400).send('Request needs a password');
    }
      else {
        
        Profile.findOne({ email: email}, (err: any, profile: any) => {
          console.log('Finding Profile ...');
          if (err) return res.status(400).send({msg: err });
          if (!profile) return res.status(400).json({msg: 'The Profile does not exist' });
          if (profile.email === newEmail) return res.status(400).json({msg: 'Please enter an email that is different than your current one.'});

          let filter = { email: email };
          let update = { email: newEmail};
  
          console.log('Comparing passwords ...')
          profile.comparePassword(password, (err: any, isMatch: any) => {
            if (isMatch && !err) {
              console.log('Passwords matched!');

              // Send Email and Check Code
              changeEmailCode(newEmail, email, req, res);
              
              Profile.updateOne(filter, update)
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

function changeEmailCode(newEmail: string, oldEmail: string, req: any, res: any) {
  const changeEmailOptionsOld = {
    from: 'info@finalbossar.com', 
    to: oldEmail, 
    subject: 'Change Email',
    html:
    `
      <h1>Final Boss Studios</h1>
      <p>This is an email to inform you that your 
      FinalBossAR.com Profile's email has changed to: ${newEmail}.
      
      If you have not changed this yourself, please update
       your password and/or contact us @ contactus@finalbossar.com
      </p>
      `
  };
  const changeEmailOptionsNew = {
    from: 'info@finalbossar.com', 
    to: newEmail, 
    subject: 'Change Email',
    html:
    `
      <h1>Final Boss Studios</h1>
      <p>This is an email to inform you that your 
      FinalBossAR.com Profile has been successfully updated.
      `
  };

    var transporter =  nodemailer.createTransport({
      service: 'hotmail',
      auth: {
            user: 'admin@finalbossar.com',
            pass: process.env.PASS,
        },
        debug: true, // show debug output
        logger: true // log information in console
    });
  
    transporter.sendMail(changeEmailOptionsOld, function (err: any, info: any) {
      if(err) {
        console.log(err)
        return res.status(400).json(err);
      }
      else {
        console.log(info);
        console.log('Email sent to Final Boss Admin');
      }
    });
    transporter.sendMail(changeEmailOptionsNew, function (err: any, info: any) {
      if(err) {
        console.log(err)
        return res.status(400).json(err);
      }
      else {
        console.log(info);
        console.log('Email sent to Final Boss Admin');
        return res.status(200).send("Send Email to user");
      }
    });
}

exports.changePassword = (req: any, res: any ) => {
    console.clear();
    console.log('Attempting to change Profile password...')
    console.log(req.body);
  
    let email = req.body.email;
    let newPassword = req.body.newPassword;
    let oldPassword = req.body.oldPassword;

    if (!email || !newPassword) {
        res.status(400).send('Needs email, new password, and old password')
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

  
          console.log(profile);
          console.log('Comparing passwords ...');
          // Check to see if newPassword is the same as the old one.
          profile.comparePassword(newPassword, (err: any, isMatch: any) => {

            if (!isMatch && !err) {
  
              // Create new hashed password
              bcrypt.genSalt(10, (err: any, salt: any) => {
  
                if (err) return (err);
                bcrypt.hash(newPassword, salt, (err: any, hash: string) => {
                  
                  console.log('New Password Hashed: ' + hash);
                  let filter = { email: email };
                  let update = { password: hash }
  
                  Profile.findOneAndUpdate(
                    filter, 
                    update,
                    (err: any, profile: any) => {
                      if (err) return err;
                      if(!profile) throw Error('No Profile with that email');
                      console.log('Updated Password: ' + JSON.stringify(profile));
                      return res.status(200).send(isMatch);

                    })
                    // .then( (data: any) => {
                    //   return res.status(200).send(isMatch);
                    // })
                    // .catch( (err: any) => {
                    //   console.log(err);
                    //   return res.status(400).end('There was an error');
                    // })
                });
              })
            } else {
              console.log(isMatch);
              return res.status(400).json({msg: 'Cannot have previously used password!'});
            }
          })
        })
      }
}

exports.forgotChangePassword = (req: any, res: any ) => {
    console.clear();
    console.log('Attempting to change Profile password...')
    console.log(req.body);
  
    let email = req.body.email;
    let newPassword = req.body.newPassword;

    if (!email || !newPassword) {
        res.status(400).send('Needs email, new password, and old password')
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

  
          console.log(profile);
          console.log('Comparing passwords ...');
          // Check to see if newPassword is the same as the old one.
          profile.comparePassword(newPassword, (err: any, isMatch: any) => {

            if (!isMatch && !err) {
  
              // Create new hashed password
              bcrypt.genSalt(10, (err: any, salt: any) => {
  
                if (err) return (err);
                bcrypt.hash(newPassword, salt, (err: any, hash: string) => {
                  
                  console.log('New Password Hashed: ' + hash);
                  let filter = { email: email };
                  let update = { password: hash }
  
                  Profile.findOneAndUpdate(
                    filter, 
                    update,
                    (err: any, profile: any) => {
                      if (err) return err;
                      if(!profile) throw Error('No Profile with that email');
                      console.log('Updated Password: ' + JSON.stringify(profile));
                      return res.status(200).send(isMatch);

                    })
                    // .then( (data: any) => {
                    //   return res.status(200).send(isMatch);
                    // })
                    // .catch( (err: any) => {
                    //   console.log(err);
                    //   return res.status(400).end('There was an error');
                    // })
                });
              })
            } else {
              console.log(isMatch);
              return res.status(400).json({msg: 'Cannot have previously used password!'});
            }
          })
        })
      }
}
 
// Send Code to the user's entered Email address
function generateCode(length: number) {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;

  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  // console.log('Generated Code: ' + result);
  return result;
}

exports.forgotEmailValidation = (req: any, res: any ) => {
  console.log('Attempting Forgot Code & Email Validation...')
  console.log(req.body);

  let email = req.body.email;
  let code = generateCode(4);

  if (!email) {
      res.status(400).send('Needs email.')
  } else {

      console.log('Finding Profile ...');
      console.log(code);
      // Find Profile, compare password, then update email.
      Profile.findOne({ email: email}, (err: any, Profile: any) => {
        if (err) {
          return res.status(400).send({ 'msg': err });
        }

        if (!Profile) {
          return res.status(400).json({ msg: 'The Profile does not exist' });
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
       const mailOptions = {
        from: 'register@finalbossar.com', // sender address
        to: `${email}`, // list of receivers
        subject: 'FinalBossAR Forgot Password Code',
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
          <p style="font-size: 1.4em;">Please use this code on the website to complete your forgot password process: </p>
          
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
          return res.status(400).json({msg: "There was an error sending code to email.", err});
        }
        else {
          console.log(info);
          return res.status(200).json({code})
        }
       });
      })

    }
}