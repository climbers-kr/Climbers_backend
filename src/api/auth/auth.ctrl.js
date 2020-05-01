require('dotenv').config();
import Joi from 'joi';
import User from '../../models/user';
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AT;
const client = require('twilio')(accountSid, authToken);


export const checkUserConflict=async (req, res, next)=> {
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
    console.log(phone);
    const query={
        ...(phone ? {'phone': phone}: {}),
    };
    try{
        const exists=await User.findOne(query);
        if(exists){
            //Todo: 중복된 폰번호 등록한 사용자 추가 인증 받기
        }
        const generateRandom = function (min, max) {
            const ranNum = Math.floor(Math.random()*(max-min+1)) + min;
            return ranNum;
        };

        //Todo: sendSMS api 호출
        client.messages
            .create({body: generateRandom(10**5, 10**6-1), from: '+17653798646', to: `+82${phone}`})
            .then(message => console.log(message.sid))
            .then(res.send('message send!'));
        //Todo: 데이터베이스에 인증번호 6자리 생성해서 암호화된 상태로 저장

        return res.status(200).end();
    }catch(e){
        console.error(e);
        return next(e);
    }
};
/*
    POST /api/auth/register
*/
export const register=async (req, res, next)=> {
    console.log("login register");

    //Request Body 검증하기
    const schema=Joi.object().keys({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(20)
            .required(),
        password: Joi.string().required(),
    });
    const result=Joi.validate(req.body, schema);
    if(result.error){
        console.log('result error');
        return res.status(400).send(result.error);
    }

    const {username, password}=req.body;
    console.dir(req.body);
    try{
        //username이 이미 존재하는지 확인
        const exists=await User.findByUsername(username);
        if(exists){
            console.log("이미 존재");
            return res.status(409).end();
        }

        const user=new User({
            username,
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