'use strict';
require('dotenv').config();

const response = require('../responses/response');
const connection = require('../config/connect');

const crypto = require('crypto');
const algorithm = process.env.ENC_ALGORITHM || 'aes256';
const password = process.env.ENC_PASS || 'nomadic';
const jwt = require('jsonwebtoken');

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

exports.createUsers = (req, res) => {
  const { name, email, phone, address, gender } = req.body;
  const password = encrypt(req.body.password);

  if (!name) {
    response.falseRequirement(res, 'name');
  } else if (!password) {
    response.falseRequirement(res, 'password');
  } else if (!email) {
    response.falseRequirement(res, 'email');
  } else if (!address) {
    response.falseRequirement(res, 'address');
  } else {
    connection.query(
      `SELECT * from users where email=\'${email}\' LIMIT 1`,
      (error, rowss, field) => {
        if (error) {
          console.log(error);
        } else {
          if (rowss != '') {
            return response.invalid(res, 'email');
          } else {
            connection.query(
              //insert
              `Insert into users set name=?, password=?, email=?, phone=?, address=?, gender=?`,
              [name, password, email, phone, address, gender],
              (error, rowsss, field) => {
                if (error) {
                  console.log(error);
                } else {
                  connection.query(
                    `SELECT *  FROM users ORDER BY id DESC LIMIT 1`,
                    (error, data, field) => {
                      if (error) {
                        console.log(error);
                      } else {
                        return response.changed(res, data, 'added');
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  }
};

exports.login = (req, res) => {
  const email = req.body.email || '';
  const password = req.body.password || '0';
  let encrypted = encrypt(password);
  const query = `SELECT * FROM users WHERE email='${email}' AND password='${encrypted}'`;
  connection.query(query, (error, rows, field) => {
    if (error) {
      return response.loginFailed(res);
    } else {
      if (rows != '') {
        const token = jwt.sign({ rows }, process.env.JWT_KEY, {
          expiresIn: '24h'
        });
        return response.loginSuccess(res, rows, token);
      } else {
        return response.loginFailed(res);
      }
    }
  });
};

//  Forgot password
exports.forgotPassword = (req, res) => {
  const email = req.body.email;
  if (email === '') {
    res.json('Email required !');
  } else {
    connection.query(
      `SELECT * from users WHERE email = ${email}`,
      (error, rows, field) => {
        if (rows === '') {
          console.log('Email not in database');
          res.json('Email nothing in db ');
        } else {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'maslownr@gmail.com',
              pass: '085959933411'
            }
          });

          const mailOptions = {
            from: 'maslownr@gmail.com',
            to: `${users.email}`,
            subject: 'Link to reset password',
            text:
              'Ingin melihat passwordmu ? klik link berikut !\n' +
              `https://elevenia.herokuapp.com/users/resetPassword/${users._id}`
          };

          transporter.sendMail(mailOptions, function(err, res) {
            if (err) {
              console.error('something wrong ', err);
            }
          });
        }
        return res.status(200).json({
          status: 200,
          message: `Data has been sended to email ${users.email}`
        });
      }
    );
  }
};

exports.changePassword = (req, res) => {
  let id = req.params.id;
  let password = req.body.password;
  let passEncrypt = encrypt(password);
  console.log(password);
  const query = `UPDATE users SET password='${passEncrypt}' WHERE id=${id}`;
  connection.query(query, (error, rows, field) => {
    if (error) {
      return res.send(error);
    } else {
      if (rows.affectedRows === 1) {
        res.status(200).json({
          status: 201,
          data: rows
        });
      } else {
        res.status(404).json({
          status: 404,
          data: 'Data not found !'
        });
      }
    }
  });
};

exports.getUsersById = (req, res) => {
  const id = req.userData.id;
  const query = `SELECT * FROM users WHERE id = ${id}`;
  connection.query(query, (error, rows, fields) => {
    if (error) {
      return res.send(error);
    } else {
      if (rows !== '') {
        res.status(200).json({
          status: 201,
          data: rows
        });
      } else {
        res.status(401).json({
          status: 404,
          data: 'Data not found !'
        });
      }
    }
  });
};

exports.editUsers = (req, res) => {
  let id = req.params.id;
  let { name, password, email, address, gender } = req.body;
  let phone = parseInt(req.body.phone);
  let passEncrypt = encrypt(password);
  console.log(passEncrypt);
  const query = `UPDATE users SET name='${name}', password='${passEncrypt}', email='${email}', address='${address}', phone='${phone}',gender='${gender}' WHERE id=${id}`;
  connection.query(query, (error, rows, field) => {
    if (error) {
      return res.send(error);
    } else {
      if (rows.affectedRows === 1) {
        res.status(200).json({
          status: 201,
          data: rows
        });
      } else {
        res.status(404).json({
          status: 404,
          data: 'Data not found !'
        });
      }
    }
  });
};
