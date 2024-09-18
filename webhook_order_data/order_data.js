const axios = require("axios");
const https = require("https");
const nodemailer = require("nodemailer");
const { type } = require("os");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  secure: true,
});

function order_data(res, data) {
  console.log("order_data");
  const { name } = JSON.parse(data);
  console.log(process.env.BASE_URL);
  const mailData = {
    from: process.env.EMAIL, // sender address
    to: process.env.RECEIVER, // list of receivers
    subject: `Order - [${name}] Failed to send vportal`,
    text: "",
    html: `Order - <b>${name}</b> failed to send vportal`,
  };
  try {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    axios
      .request(config)
      .then((response) => {
        console.log("sendStatus 200");
        console.log("Response data: ", response.data);
        console.log("Response status: ", response.status);
        console.log("Response headers: ", response.headers);
      })
      .catch((error) => {
        transporter.sendMail(mailData, function (err, info) {
          if (err) {
            console.log({ msg: `Error in sending Mail - ${err}` });
          } else {
            console.log({ msg: `mail send successfully` });
          }
        });
        if (error.response) {
          console.log("sendStatus " + error.response.status);
        } else if (error.request) {
          console.log("sendStatus 500");
          console.log("Error message: No response received");
        } else {
          console.log("sendStatus 500");
        }
      });
  } catch (error) {
    console.error(error);
  }
}

module.exports = order_data;
