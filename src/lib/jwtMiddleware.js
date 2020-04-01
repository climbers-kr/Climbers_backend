import jwt from 'jsonwebtoken';
import User from '../models/user';

const jwtMiddleware=async (req, res, next)=>{
    const token=req.cookies.access_token;
    let decoded;
    if(!token){
        console.log("토큰 없음");
        return next(); //토큰 없음
    }

    try{
        decoded=jwt.verify(token, process.env.JWT_SECRET);
    }catch(e){
        console.error(e);
        res.clearCookie('access_token');
        return res.status(403).end();
    }


    try{
        res.locals.user={
            _id: decoded._id,
            username: decoded.username,
        };

        //토큰의 남은 유효 기간이 3.5일 미만이면 재발급
        const now=Math.floor(Date.now() / 1000);


        if(decoded.exp - now < 60*60*24*3.5){

            console.log("토근 재발급~~~~");
            const user=await User.findById(decoded._id);
            const token=user.generateToken();
            res.cookie('access_token', token, {
                maxAge: 1000*60*60*24*7,
                httpOnly: true,
            });
        }else{
            console.log("토근 재발급 NONONO~~~~");
        }

        return next();
    }catch(e) {
        console.error(e);
        return next(e);
    }
};

export default jwtMiddleware;