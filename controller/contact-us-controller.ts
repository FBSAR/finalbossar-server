const nodemailer = require('nodemailer')
const contactUs = require('../models/contact-us.model.ts');


exports.contactUsTest = (req: any, res: any ) => {
    console.log('Contact API Works!')
    return res.status(200).json({msg: "contact us worked"})
}

exports.sendMessage = (req: any, res: any) => {

    console.clear();
    console.log('Sending Message');
    console.log(req.body);
  
    let fullName = req.body.fullName;
    let email = req.body.email;
    let message = req.body.message;
  
    if(!fullName || !email) {
      console.log('There was either no Full Name or Email in the Request!');
      return res.status(400).json({msg: "There was either no Code or Email in the Request!"})
    }
  
    // Set transport service which will send the emails
    var transporter =  nodemailer.createTransport({
      service: 'hotmail',
      auth: {
            user: 'eddie@finalbossar.com',
            pass: 'Et061792!',
        },
        debug: true, // show debug output
        logger: true // log information in console
    });
  
  //  configuration for email details
   const mailOptions = {
    from: 'eddie@finalbossar.com', 
    to: `eddie@finalbossar.com`, 
    subject: 'Message from CONTACT-US | Finalbossar.com',
    html:
    `
      <h1>Final Boss Studios</h1>
      <p>${fullName}</p>
      <p>${email}</p>
      <p>${message}</p>
      `
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