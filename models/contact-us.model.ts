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
  
  const ContactUs = mongoose.model('ContactUs', ContactUsSchema);
  module.exports = ContactUs;