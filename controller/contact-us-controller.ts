export {};
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const ContactUs = require('../models/contact-us.model.ts');

exports.sendMessage = (req: any, res: any) => {
    let fullName = req.body.fullName;
    let email = req.body.email;
    let message = req.body.message;
  
    if(!fullName || !email || !message) {
      console.log('There was either no Full Name or Email in the Request!');
      return res.status(400).json({msg: "There was either no Fullname, Email, or Message in the Request!"})
    }

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

    //  configuration for email details
    const FBSMailOptions = {
    from: 'admin@finalbossar.com', 
    to: `admin@finalbossar.com`, 
    subject: 'Message from CONTACT-US | Finalbossar.com',
    html:
    `
      <h1>Final Boss Studios</h1>
      <p>${fullName}</p>
      <p>${email}</p>
      <p>${message}</p>
      `
    };
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

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))
  

    // Thank the User for contacting Final Boss Studios!
    var userMailOptions = {
    from: 'contact@finalbossar.com', 
    to: `${email}`, 
    subject: '√ Message from Final Boss Studios (finalbossar.com)',
    template: 'email',
    context: {
      fullName
    }
    }
  
    //  Email sent to Final Boss
    transporter.sendMail(FBSMailOptions, function (err: any, info: any) {
      if(err) {
        console.log(err)
        return res.status(400).json(err);
      }
      else {
        console.log(info);
        console.log('Email sent to Final Boss Admin');
        

        //  Email sent to user
        transporter.sendMail(userMailOptions, function (err: any, info: any) {
          if(err) {
            console.log(err)
            return res.status(400).json(err);
          }
          else {
            console.log(info);
            console.log('Email sent to User');

            let newContactMessage = ContactUs({
              fullName,
              email,
              message
            })

            newContactMessage.save((err: Error, message: any) => {
              if (err) {
                return res.status(400).json({ 'msg': err });
            }
            console.log(message);
            
            return res.status(200).json({
              responseMsg: "Contact Message was sent"
              })
            })
            
            
          }
        });
      }
   });
}