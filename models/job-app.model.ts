export {};
const mongoose = require('mongoose');

const JobAppSchema: any = new mongoose.Schema(
    {
      job: {
        type: String,
        maxlength: 40,
      },
      availability: {
        type: Date,
      },
      saved: {
        type: Boolean,
        default: false,
      },
      firstName: {
        type: String,
        maxlength: 40,
      },
      lastName: {
        type: String,
        maxlength: 40,
      },
      age: {
        type: Number,
        maxlength: 100,
      },
      gender: {
        type: String,
        maxlength: 30,
      },
      phone: {
        type: String,
        maxlength: 10,
      },
      email: {
        type: String,
        maxlength: 40,
      },
      dateApplied: {
        type: Date,
      },
      addressOne: {
        type: String,
        maxlength: 40,
      },
      addressTwo: {
        type: String,
        maxlength: 40,
      },
      city: {
        type: String,
        maxlength: 40,
      },
      state: {
        type: String,
        maxlength: 2,
      },
      zip: {
        type: String,
        maxlength: 5,
      },
      resume: {
        type: String,
        maxlength: 700,
      },
      goodFitReason: {
        type: String,
        maxlength: 500,
      },
      favoriteGames: {
        type: String,
        maxlength: 500,
      },
      strengthWeaknesses: {
        type: String,
        maxlength: 500,
      }
  });

  const JobApp = mongoose.model('JobApp', JobAppSchema);
  module.exports = JobApp;