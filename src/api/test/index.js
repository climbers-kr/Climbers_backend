const express = require('express');
require('dotenv').config();
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AT;
const client = require('twilio')(accountSid, authToken);
const test=express.Router();
const sendSMS=(req, res, text)=>{
    client.messages
        .create({body: text, from: '+17653798646', to: '+821036845120'})
        .then(message => console.log(message.sid))
        .then(res.send('message send!'));
};
test.get('/', (req, res)=>{
    sendSMS(req, res, 'test success');
});



export default test;