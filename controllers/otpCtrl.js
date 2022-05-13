require("dotenv").config();
const { OTP } = require("../sequelize");
const { encode, decode } = require("../middlewares/crypt");
const otpGenerator = require("otp-generator");
const AWS = require("aws-sdk");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const AddMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

let dates = {
  convert: function (d) {
    // Converts the date in d to a date-object. The input can be:
    //   a date object: returned without modification
    //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
    //   a number     : Interpreted as number of milliseconds
    //                  since 1 Jan 1970 (a timestamp)
    //   a string     : Any format supported by the javascript engine, like
    //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
    //  an object     : Interpreted as an object with year, month and date
    //                  attributes.  **NOTE** month is 0-11.
    return d.constructor === Date
      ? d
      : d.constructor === Array
      ? new Date(d[0], d[1], d[2])
      : d.constructor === Number
      ? new Date(d)
      : d.constructor === String
      ? new Date(d)
      : typeof d === "object"
      ? new Date(d.year, d.month, d.date)
      : NaN;
  },
  compare: function (a, b) {
    // Compare two dates (could be of any type supported by the convert
    // function above) and returns:
    //  -1 : if a < b
    //   0 : if a = b
    //   1 : if a > b
    // NaN : if a or b is an illegal date
    return isFinite((a = this.convert(a).valueOf())) &&
      isFinite((b = this.convert(b).valueOf()))
      ? (a > b) - (a < b)
      : NaN;
  },
  inRange: function (d, start, end) {
    // Checks if date in d is between dates in start and end.
    // Returns a boolean or NaN:
    //    true  : if d is between start and end (inclusive)
    //    false : if d is before start or after end
    //    NaN   : if one or more of the dates is illegal.
    return isFinite((d = this.convert(d).valueOf())) &&
      isFinite((start = this.convert(start).valueOf())) &&
      isFinite((end = this.convert(end).valueOf()))
      ? start <= d && d <= end
      : NaN;
  },
};

const otpCtrl = {
  otpEmail: async (req, res, next) => {
    try {
      const { email, type } = req.body;
      let email_subject, email_message;
      if (!email) {
        const response = { Status: "Failure", Details: "Email not provided" };
        return res.status(400).send(response);
      }
      if (!type) {
        const response = { Status: "Failure", Details: "Type not provided" };
        return res.status(400).send(response);
      }
      const foundUser = await User.findOne({ email: email });
      if (!foundUser) {
        return res
          .status(400)
          .send({ Status: "Failure", Details: "Email not registered" });
      }
      const otp = otpGenerator.generate(6, {
        alphabets: false,
        upperCase: false,
        specialChars: false,
      });
      const now = new Date();
      const expiration_time = AddMinutesToDate(now, 5);

      const newOTP = new OTP({
        otp: otp,
        expiration_time: expiration_time,
      });

      const otp_instance = await newOTP.save();
      let details = {
        timestamp: now,
        check: email,
        success: true,
        message: "OTP sent to user",
        otp_id: otp_instance._id,
      };

      const encoded = encode(JSON.stringify(details));

      if (type) {
        if (type == "VERIFICATION") {
          const {
            message,
            subject_mail,
          } = require("../templates/email/email_verification");
          email_message = message(otp);
          email_subject = subject_mail;
        } else if (type == "FORGET") {
          const {
            message,
            subject_mail,
          } = require("../templates/email/email_forget");
          email_message = message(otp);
          email_subject = subject_mail;
        } else if (type == "2FA") {
          const {
            message,
            subject_mail,
          } = require("../templates/email/email_2FA");
          email_message = message(otp);
          email_subject = subject_mail;
        } else {
          const response = {
            Status: "Failure",
            Details: "Incorrect Type Provided",
          };
          return res.status(400).send(response);
        }
      }

      console.log(email_subject);

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: `${process.env.EMAIL_ADDRESS}`,
          pass: `${process.env.EMAIL_PASSWORD}`,
        },
      });

      console.log("After transporter creation");

      const mailOptions = {
        from: `"Oghenero Ologe"<${process.env.EMAIL_ADDRESS}>`,
        to: `${email}`,
        subject: email_subject,
        text: email_message,
      };

      console.log("After mail options");

      await transporter.verify();

      console.log("After transporter verification");

      let statusCode;
      let resp;

      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log("Here in transporter");
          statusCode = 400;
          resp = { Status: "Failure", Details: err };
        } else {
          console.log("Success");
          statusCode = 200;
          resp = { Status: "Success", Details: encoded };
        }
        res.status(statusCode).json(resp);
      });
    } catch (err) {
      const response = { Status: "Failure", Details: err.message };
      console.log("Here in catch");
      return res.status(400).send(response);
    }
  },
  otpPhone: async (req, res, next) => {
    try {
      const { phone_number, type } = req.body;

      let phone_message;

      if (!phone_number) {
        const response = {
          Status: "Failure",
          Details: "Phone Number not provided",
        };
        return res.status(400).send(response);
      }

      if (!type) {
        const response = { Status: "Failure", Details: "Type not provided" };
        return res.status(400).send(response);
      }

      // Generate OTP
      const otp = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const now = new Date();
      const expiration_time = AddMinutesToDate(now, 10);

      const newOTP = new OTP({
        otp: otp,
        expiration_time: expiration_time,
      });

      const otp_instance = await newOTP.save();

      let details = {
        timestamp: now,
        check: phone_number,
        success: true,
        message: "OTP sent to user",
        otp_id: otp_instance._id,
      };

      const encoded = encode(JSON.stringify(details));

      if (type) {
        if (type == "VERIFICATION") {
          const message = require("../templates/SMS/phone_verification");
          phone_message = message(otp);
        } else if (type == "FORGET") {
          const message = require("../templates/SMS/phone_forget");
          phone_message = message(otp);
        } else if (type == "2FA") {
          const message = require("../templates/SMS/phone_2FA");
          phone_message = message(otp);
        } else {
          const response = {
            Status: "Failure",
            Details: "Incorrect Type Provided",
          };
          return res.status(400).send(response);
        }
      }

      // let params = {
      //   Message: phone_message,
      //   PhoneNumber: phone_number,
      // };
      const accountSid = process.env.ACCOUNT_SID;
      const authToken = process.env.AUTH_TOKEN;
      const client = require("twilio")(accountSid, authToken);
      const newUser = new User({
        phone_number: phone_number,
      });
      client.messages
        .create({
          body: phone_message,
          messagingServiceSid: process.env.MESSAGING_SERVICE_SID,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+${phone_number}`,
        })
        .then((message) => console.log(message.sid))
        .done();
      await newUser.save();
      return res.status(200).json({ Status: "Success", Details: encoded });
    } catch (err) {
      const response = { Status: "Failure", Details: err.message };
      return res.status(400).send(response);
    }
  },
  verifyOtp: async (req, res, next) => {
    try {
      var currentdate = new Date();
      console.log(currentdate.getHours());
      console.log(currentdate);
      const { verification_key, otp, check } = req.body;

      if (!verification_key) {
        const response = {
          Status: "Failure",
          Details: "Verification Key not provided",
        };
        return res.status(400).send(response);
      }
      if (!otp) {
        const response = { Status: "Failure", Details: "OTP not Provided" };
        return res.status(400).send(response);
      }
      if (!check) {
        const response = { Status: "Failure", Details: "Check not Provided" };
        return res.status(400).send(response);
      }

      let decoded;

      //Check if verification key is altered or not and store it in variable decoded after decryption
      try {
        decoded = decode(verification_key);
      } catch (err) {
        const response = { Status: "Failure", Details: "Bad Request" };
        return res.status(400).send(response);
      }

      console.log(decoded);

      let obj = JSON.parse(decoded);
      const check_obj = obj.check;

      // Check if the OTP was meant for the same email or phone number for which it is being verified
      if (check_obj != check) {
        const response = {
          Status: "Failure",
          Details: "OTP was not sent to this particular email or phone number",
        };
        return res.status(400).send(response);
      }

      const otp_instance = await OTP.findOne({ _id: obj.otp_id });

      //Check if OTP is available in the DB
      if (otp_instance != null) {
        //Check if OTP is already used or not
        if (otp_instance.verified != true) {
          //Check if OTP is expired or not
          console.log(otp_instance.expiration_time);
          if (dates.compare(otp_instance.expiration_time, currentdate) == 1) {
            //Check if OTP is equal to the OTP in the DB
            if (otp === otp_instance.otp) {
              // Mark OTP as verified or used
              otp_instance.verified = true;
              await otp_instance.save();
              const foundUser = await User.findOne({ phone_number: check_obj });
              foundUser.otp_verified = true;
              await foundUser.save();
              const response = {
                Status: "Success",
                Details: "OTP Matched",
                Check: check,
              };
              return res.status(200).send(response);
            } else {
              const response = {
                Status: "Failure",
                Details: "OTP NOT Matched",
              };
              return res.status(400).send(response);
            }
          } else {
            const response = { Status: "Failure", Details: "OTP Expired" };
            return res.status(400).send(response);
          }
        } else {
          const response = { Status: "Failure", Details: "OTP Already Used" };
          return res.status(400).send(response);
        }
      } else {
        const response = { Status: "Failure", Details: "Bad Request" };
        return res.status(400).send(response);
      }
    } catch (err) {
      const response = { Status: "Failure", Details: err.message };
      return res.status(400).send(response);
    }
  },
};

module.exports = otpCtrl;
