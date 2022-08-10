export {};
const config = require('config');
const mongoose = require('mongoose');

const ContactUsSchema = new mongoose.Schema(
    {
      fullName: {
        type: String,
        maxlength: 100,
      },
      email: {
        type: String,
        maxlength: 100,
      },
      message: {
        type: String,
        maxlength: 500,
      },
  })
  
  
  ContactUsSchema.methods.helloWorld = function(candidatePassword: any, cb: (err: Error | null, isMatch: boolean) => void) {
   console.log('Landing Page Schema Method -- helloWorld()');
   console.log('Hello World!');
   
  }
  
  
  const ContactUs = mongoose.model('ContactUs', ContactUsSchema);
  module.exports = ContactUs;