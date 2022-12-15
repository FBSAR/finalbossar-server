export {};
const nodemailer = require('nodemailer');
const dateFNS = require('date-fns');
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const Admin = require('../models/admin.model.ts');
const Profile = require('../models/profile.model.ts');
const JobApp = require('../models/job-app.model.ts');

interface Admin {
    email: string,
    password: string,
}
interface Profile {
    email: string,
    firstName: string,
    lastName: string,
    newsletter: boolean,
    dateRegistered: string,
}
interface Token {
  email: string,
  firstName: string,
  lastName: string,
}
interface applyingUser {
    job: String,
    availability: String,
    firstName: String,
    lastName: String,
    age: String,
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
    xrExperience: String
}

exports.loginAdmin = (req: any, res: any) => {
  console.log('Trying Login Admin');
  let email = req.body.email;
  let password = req.body.email;
  if(!email || !password) {
    return res.status(400).json({msg: "No email & password"})
  }
  
  Admin.findOne({ email: req.body.email }, (err: Error, admin: any) => {
    if (err) {
        return res.status(400).send({ 'msg': err });
    }

    if (!admin) {
        return res.status(400).json({ 'msg': 'The Admin does not exist' });
    }

    admin.comparePassword(req.body.password, (err: Error, isMatch: Boolean) => {
        if (isMatch && !err) {
            console.log(`isMatch = ${isMatch}`)
            console.log('Logged in as: ' + admin.email);
            return res.status(200).json({ 
                msg: 'The User has logged in.',
                isMatch: true
            });
        } else {
            return res.status(400).json({ 
                msg: 'The email and password don\'t match.',
                isMatch: false
            });
        }
    });
});
}
exports.registerAdmin = (req: any, res: any) => {
  console.log('Trying Register Admin');
  let email = 'admin@finalbossar.com';
  let password = 'bossfinaL7$';

  Admin.findOne(
      {email: email},
      (err: any, admin: any) => {
          if(err) return res.status(400).json({err})
          if(admin) return res.status(400).json({msg: "This is already an admin registered!"})
          else {
            let newAdmin = Admin({
                email,
                password
            });
            
            newAdmin.save((err: Error, newAdmin: Admin) => {
                if (err) {
                    console.log(err)
                    return res.status(400).json({ 'msg': err });
                }
                if (!newAdmin) {
                    console.log('There was no admin saved!')
                    return res.status(400).json({ msg: 'There was no admin saved!' });
                }
                console.log('Admin registered!');
                return res.status(200).json(newAdmin);
                });
          }
      }
  )

  
}
exports.getProfiles = (req: any, res: any) => {
  console.log('Trying to get all Profiles');

  Profile.find(
    (err: Error, profiles: Array<Profile>) => {
        if(err) {
            return res.status(400).json({ 'msg': err });
        }
        console.log('Found Profiles');
        console.log(profiles);
        
        if(profiles) {
            return res.status(200).json({
                profileCount: profiles.length,
                profiles
            });
        } else {
            return res.status(400).json({ msg: "There were no profiles" });
            }
        }
    )
}
exports.getJobApps = (req: any, res: any) => {
  console.log('Trying to get all Job Apps');

  JobApp.find(
    (err: Error, applyingUsers: Array<applyingUser>) => {
        if(err) {
            return res.status(400).json({ 'msg': err });
        }
        console.log('Found Applying Users');
        console.log(applyingUsers);
        
        if(applyingUsers) {
            return res.status(200).json({
                applyingUsersCount: applyingUsers.length,
                applyingUsers
            });
        } else {
            return res.status(400).json({ msg: "There were no applying users!" });
            }
        }
    )
}
exports.saveApp = (req: any, res: any) => {
  console.log('Trying to get all Job Apps');

  JobApp.findOneAndUpdate(
    {_id: req.body._id},
    {saved: true},
    (err: Error, app: any) => {
        if(err) {
            return res.status(400).json({ 'msg': err });
        }
        if(app) {
            return res.status(200).json({
                app
            });
        } else {
            return res.status(400).json({ msg: "There were no applying users!" });
            }
        }
    )
}
exports.unSaveApp = (req: any, res: any) => {
  console.log('Trying to get all Job Apps');

  JobApp.findOneAndUpdate(
    {_id: req.body._id},
    {saved: false},
    (err: Error, app: any) => {
        if(err) {
            return res.status(400).json({ 'msg': err });
        }        
        if(app) {
            return res.status(200).json({
                app
            });
        } else {
            return res.status(400).json({ msg: "There were no applying users!" });
            }
        }
    )
}
exports.denyApp = (req: any, res: any) => {
  JobApp.findOneAndDelete(
    {_id: req.body._id},
    (err: Error, app: any) => {
        if(err) {
            return res.status(400).json({ 'msg': err });
        }
        
        if(app) {
            return res.status(200).json({
                app
            });
        } else {
            return res.status(400).json({ msg: "There were no deleted app!" });
            }
        }
    )
}
exports.sendNewsletter = (req: any, res: any) => {
    let emailSubject = req.body.emailSubject;
    let title = req.body.title;
    let newsletter = req.body.newsletter;

    if(!emailSubject || !title || !newsletter) {
        console.log('The newsletter request didnt have all its properties');
        return res.status(400).json({msg: "The newsletter request didnt have all its properties"})
    }

    Profile.find(
        async (err: Error, profiles: Array<Profile>) => {
            if(err) {
                return res.status(400).json({ 'msg': err });
            }
            console.log('Found Profiles');
            console.log(profiles);
            
            if(profiles) {
                // Set transport service which will send the emails
                var transporter =  await nodemailer.createTransport({
                    service: 'hotmail',
                    auth: {
                          user: 'admin@finalbossar.com',
                          pass: process.env.PASS,
                      },
                      debug: true, // show debug output
                      logger: true // log information in console
                  })
                  // Create HTML Template w/ Handlebars
                  // point to the template folder
                  const handlebarOptions = {
                    viewEngine: {
              
                        partialsDir: path.resolve('./controller/emails/'),
                        defaultLayout: false,
                    },
                    viewPath: 
                    path.resolve('./controller/emails/'),
                  };

                  //Create maillist out of profiles
                  var mailList: Array<String> = []  
                  
                  await profiles.forEach(profile => {
                      if (profile.newsletter) {
                          mailList.push(profile.email);
                      }
                  });
              
                  // Thank the User for contacting Final Boss Studios!
                  var newsletterOptions = {
                      from: 'newsletter@finalbossar.com', 
                      to: mailList, 
                      subject: `${emailSubject}`,
                      template: 'newsletter',
                      context: {
                        title,
                        newsletter
                      }
                      }
                  ;
              
                  // use a template file with nodemailer
                  transporter.use('compile', hbs(handlebarOptions))
                
                  //  Email sent to Users
                  transporter.sendMail(newsletterOptions, function (err: any, info: any) {
                    if(err) {
                      console.log(err)
                      return res.status(400).json(err);
                    }
                    else {
                      console.log(info);
                      console.log('Newsletter sent to Users!');
                      return res.status(200).json({
                          msg: 'Newsletter has been sent to Users!'
                      });
                    }
                 });
            } else {
                return res.status(400).json({ msg: "There were no profiles" });
                }
            }
        )
  
    
}