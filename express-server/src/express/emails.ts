const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'ap-southeast-2'
  });

const ses = new aws.SES({ apiVersion: '2010-12-01' }); //

export function sendEmail(subject, recipient, message) {
   
  
    const params = {
      Destination: {
        ToAddresses: [recipient]
      },
      Message: {
        Body: {
          Text: {
            Data: message
          }
        },
        Subject: {
          Data: subject
        }
      },
      Source: 'airco879@student.otago.ac.nz'
    };
  
    return new Promise((resolve, reject) => {
      ses.sendEmail(params, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }