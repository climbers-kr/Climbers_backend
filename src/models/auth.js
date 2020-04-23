import mongoose, {Schema} from 'mongoose';

//전화번호 인증 api 호출 제한
const AuthSchema=new Schema({
    username: String,
    ip: String,
    phone: String,
    count: Number,
    requestDate: {
        type: Date,
        default: Date.now,
    },
});


const Auth=mongoose.model('Auth', AuthSchema);
export default Auth;