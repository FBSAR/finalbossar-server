const aws        = require('aws-sdk');
const multer     = require('multer');
const dotenv     = require('dotenv');
const express    = require("express");
const router     = express.Router();
const fs         =require('fs');
const path       = require('path');

// Allows for us to use Environment Files
dotenv.config();

// Configures AWS settings relative to S3
aws.config.update({
    secretAccessKey: process.env.AWS_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_ID,
    region: 'us-east-2'
})

// Creates a S3 instances
const s3 = new aws.S3();

// counter for picture storage file names
// appends a prefix of 00+counter+00+ to Date.now()_profile-picture for filenames.
var counter = 1;

// Creates directory for profile pictures
const resumeStorage = multer.diskStorage({
    destination : 'fbs-resumes/',

    filename: function (req: any, file: any, cb: any) {
      // Adding the a counter and current date to each filename so that each file is unique
      cb(null, '00' + counter + '00' + Date.now() + '_resume');
    }
});

const upload = multer({
  storage: resumeStorage,
  // Filters what the files that are uploaded
  fileFilter: ( req: any, file: any, callback: any ) => {
  callback(null, true)
  },
  limits: 1024 * 1024 });

const uploadResume = ( file: any, source: any, targetName: any, res: any ) => {

  // source = full path of uploaded file
  // example : profile-picture-uploads/1588052734468_profile-picture
  // targetName = filename of uploaded fileconsole.log('This is the file');
  console.log(file)

    // captures to extension of the file e.i .png
    var ext = path.extname(file.originalname)

    if( ext === '.pdf' || '.docx' || '.png' || '.doc' || '.txt') {
       console.log('The file extention is correct. Good Job!')
    } else {
      console.error('File needs to be .pdf, doc, docx, or png')
       return res.status(400).json({msg: 'File needs to be a .pdf file'})
    }

  console.log('preparing resume upload...');

  // Increase counter and append its number to each filename every time the uploadProfilePicture method is called.
  if (counter >= 1 ) {
    ++counter;
    console.log('Counter: ' + counter)
  }

  // Read the file, upload the file to S3, then delete file from the directory 'profile-picture-uploads'.
  fs.readFile( source, ( err: any, filedata: any ) => {

    if (!err) {

      //  Creates Object to be stored in S3
      const putParams = {
          Bucket      : process.env.RESUME_S3_BUCKET_NAME,
          Key         : targetName,
          Body        : filedata,
          ContentType  : 'application/pdf',
          ACL   : 'public-read'
      };

      s3.putObject(putParams, function(err: any, data: any){
        if (err) {
          console.log('Could not upload the file. Error :', err);
          return res.send({success:false});
        }
        else {
          console.log('Data from uploading to S3 Bucket: ');
          console.log(data);

          let objectUrl = 'https://fbs-resumes.s3.us-east-2.amazonaws.com/resumes/'+targetName;

          // Remove file from profile-picture-uploads directory
          fs.unlink(source, () => {
            console.log('Successfully uploaded the file. ' + source + ' was deleted from server directory');
            console.log(objectUrl)
            return res.status(200).json({objectUrl});
          });
        }
      })
    }
    else{
      console.log({'err':err});
    }
  });
}

router.post('/upload-resume', upload.single('resume'), (req: any, res: any) => {
    console.log(req.file)
  //Multer middleware adds file(in case of single file ) or files(multiple files) object to the request object.
  uploadResume(req.file, req.file.path, req.file.filename ,res);
})

module.exports = router;