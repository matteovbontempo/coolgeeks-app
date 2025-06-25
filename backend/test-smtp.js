const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'coolgeekscomputersnc@gmail.com', // tu EMAIL_USER
    pass: 'ozigzlmmuhhibnwo'                // tu EMAIL_PASS (sin espacios)
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});
