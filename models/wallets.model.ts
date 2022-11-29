export {};
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const WalletsSchema = new mongoose.Schema(
    {
      walletAddress: {
        type: String,
        maxlength: 50,
      },
      email: {
        type: String,
        maxlength: 50,
      }
  })

// Called before save method on the model
// Turns user entered password into a hash value, with salt
WalletsSchema.pre('save', function(this: any, next: any){
    // had to use a regular function ^ to get the correct scope of 'this'.
    var user = this;
    if (!user.isModified('walletAddress')) return next();
    // Encrypt Wallet Address
    bcrypt.genSalt(10, (err: Error, salt: any) => {
      if (err) return next(err);
  
      bcrypt.hash(user.walletAddress, salt, (err: Error, hash: any) => {
        if (err) return next(err);
        if(hash) {
          console.log(`Wallet Address Salted: ${salt}`);
          user.walletAddress = hash;
          this.walletAddress = user.walletAddress;
          console.log('Wallet Address Hashed');
          console.log(user.walletAddress);
          return next();
        }
      })
    })
    if (!user.isModified('email')) return next();
    // Encrypt Email Address
    bcrypt.genSalt(5, (err: Error, salt: any) => {
      if (err) return next(err);
  
      bcrypt.hash(user.email, salt, (err: Error, hash: any) => {
        if (err) return next(err);
        if(hash) {
          console.log(`Email Salted: ${salt}`);
          user.email = hash;
          this.email = user.email;
          console.log('Email Hashed');
          console.log(user.email);
          return next();
        }
      })
    })
})
WalletsSchema.methods.comparePassword = function(candidatePassword: any, cb: any) {
            bcrypt.compare(candidatePassword, this.password, (err: Error, isMatch: Boolean) => {
            // console.log('Password: ' + candidatePassword);
            // console.log('Hashed Password: ' + this.password);
            // console.log('Passwords Match: ' + isMatch);
            if (err) return cb(err);
            cb(null, isMatch);
            })
}

const Wallets = mongoose.model('Wallets', WalletsSchema);
module.exports = Wallets;