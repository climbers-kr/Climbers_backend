import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Center from './center'

const UserSchema=new Schema({
    username: String,
    phone: String,
    profileImgUrl: String,
    name: String,
    sex: String,
    lv: String,
    introduction: String,
    location: String,
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    follower: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    joinedCenter: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Center' }],
    hashedPassword: String,
    suspicious: Boolean, //Todo: 휴대폰 번호 중복된 사용자 추가 인증 받기
});

UserSchema.methods.setPassword=async function(password) {

    const hash=await bcrypt.hash(password, 10);
    this.hashedPassword=hash;
};

UserSchema.methods.checkPassword=async function(password){
    const result=await bcrypt.compare(password, this.hashedPassword);
    return result;
};

UserSchema.statics.findByUsername=function(username){
    return this.findOne({username});
};

UserSchema.methods.serialize=function() {

    const data=this.toJSON();
    delete data.hashedPassword;
    return data;
};

UserSchema.methods.generateToken=function() {
    const token=jwt.sign(
        //첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣는다
        {
            _id: this.id,
            username: this.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
        },
    );
    return token;
};

UserSchema.methods.followUser=function(username) {
    const following=User.findByUsername(username);
    this.following.push(following);
    following.follower.push(this);

    return this.save();
};

UserSchema.methods.joinCenter=async function(centerId) {
    const center=await Center.findById(centerId);
    this.joinedCenter.push(center);
    center.member.push(this);

    return this.save();
};
const User=mongoose.model('User', UserSchema);
export default User;