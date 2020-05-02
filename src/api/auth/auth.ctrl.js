require('dotenv').config();
import Joi from 'joi';
import User from '../../models/user';
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AT;
const client = require('twilio')(accountSid, authToken);
import bcrypt from 'bcrypt';

export const checkUserConflict=async (req, res, next)=> {
    console.log("session test", req.session);
    console.log("checkUserConflict called");
    console.log(req.body)
    //Request Body 검증하기
    const schema=Joi.object().keys({
        username: Joi.string()
            .alphanum()
            .min(4)
            .max(20)
            .required(),
    });
    const result=Joi.validate(req.body, schema);
    if(result.error){
        console.log('올바른 형식이 아닙니다');
        return res.status(400).send('올바른 형식이 아닙니다');
    }
    const {username}=req.body;
    try{
        //username이 이미 존재하는지 확인
        const exists=await User.findByUsername(username);
        if(exists){
            console.log("이미 존재");
            return res.status(409).end();
        }
        return res.status(200).end();
    }catch(e){
        console.error(e);
        return next(e);
    }
};

export const requestPhoneAuth=async (req, res, next)=> {
    console.log("requestPhoneAuth called");
    const {phone}=req.body;
    try{
        const generateRandom=(min, max)=> (Math.floor(Math.random()*(max-min+1)) + min);
        //sendSMS api 호출
        /*
        client.messages
            .create({body: generateRandom(10**5, 10**6-1), from: '+17653798646', to: `+82${phone}`})
            .then(message => console.log(message.sid))
            .then(res.send('message send!'));*/
        const validationCode=generateRandom(10**5, 10**6-1);
        console.log({body: validationCode})
        //Todo: 인증번호 6자리 hash
        req.session.validationCode=validationCode;
        req.session.cookie.maxAge = 5*60*1000; //코드 유효 기간: 5분

        req.session.save(function() {
            return res.status(200).end();
        })
    }catch(e){
        console.error(e);
        return next(e);
    }
};
/*
    POST /api/auth/register
*/
export const register=async (req, res, next)=> {
    const {phone, username, name, password, validationCode} = req.body;

    if(req.session.validationCode !== Number(validationCode)) {
        //sms 인증번호 검증
        return res.status(401).send("인증번호 불일치");
    }
    //Request Body 검증하기
    const schema=Joi.object().keys({
        phone: Joi.string().required(),
        username: Joi.string()
            .alphanum()
            .min(4)
            .max(20)
            .required(),
        name: Joi.string(),
        password: Joi.string().required(),
        validationCode: Joi.string(),
    });

    const result=Joi.validate(req.body, schema);

    if(result.error){
        console.log('result error');
        console.log(result.error);
        return res.status(400).send(result.error);
    }

    try{
        //username이 이미 존재하는지 확인
        const exists=await User.findByUsername(username);
        if(exists){
            console.log("이미 존재");
            return res.status(409).end();
        }
        const query={
            ...(phone ? {'phone': phone}: {}),
        };
        const suspicious=await User.findOne(query);

        const user=new User({
            phone,
            username,
            name,
            suspicious: !!suspicious, //중복된 전화번호
        });
        await user.setPassword(password); //비번 설정
        await user.save(); //데이터베이스에 저장

        //응답할 데이터에서 hashedPassword 필드 제거
        res.body=user.serialize();

        const token=user.generateToken();

        res.cookie('access_token', token, {
            maxAge: 1000*60*60*24*7,
            httpOnly: true,
        });

        return res.json(user.serialize());
    }catch(e){
        console.error(e);
        return next(e);
    }
};
/*
    POST /api/auth/login
 */
export const login=async (req, res, next)=> {
    console.log("login called");
    const {username, password}=req.body;

    if(!username || !password) {
        //ctx.status=401;
        return res.status(401).end();
    }

    try{
        const user=await User.findByUsername(username);

        if(!user){
            //ctx.status=401;
            return res.status(401).end();
        }
        const valid=await user.checkPassword(password);
        //잘못된 비밀번호
        if(!valid) {
            //ctx.status=401;
            return res.status(401).end();
        }
        //ctx.body=users.serialize();

        const token=user.generateToken();
        res.cookie('access_token', token, {
            maxAge: 1000*60*60*24*7,
            httpOnly: true,
        });
        return res.json(user.serialize());
    }catch(e){
        //ctx.throw(500, e);
        console.error(e);
        return next(e);
    }
};
/*
* GET /api/auth/check
* */
export const check=async (req, res, next)=> {
    console.log("check called");

    const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress; //ip추적 test
    console.dir(ip);

    //로그인 상태 확인
    const user=res.locals.user;
    if(user){
        console.log("check users", user);
        return res.json(user);
    }else {
        return res.status(401).end();
    }
};


/*
* POST /api/auth/logout
* */
export const logout=async (req, res, next)=> {
    console.log('logout called');
    //로그아웃
    res.clearCookie('access_token');
    //ctx.status=204;
    console.log('logout success');
    return res.status(204).end();
};