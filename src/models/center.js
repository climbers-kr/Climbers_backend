import mongoose from 'mongoose';
const {Schema} = mongoose;
const priceSchema = new mongoose.Schema({
    period: String,
    price: String,
});
const facilitySchema = new mongoose.Schema({
    bouldering: Boolean,
    endurance: Boolean,
    lead: Boolean,
    speed: Boolean,
    outside: Boolean,
});
const CenterSchema=new Schema({
    imgUrlList: [String],
    title: String,
    location: String,
    locationDetail: String,
    locationObject: Object,
    sites: [String],
    prices: [priceSchema],
    contact: String,
    time: String,
    hasParking: false,
    facility: facilitySchema,
    imageSource: [String],
    member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], //Todo: 멤버 등록
    like: Number,
    likeList: [mongoose.Types.ObjectId],
    comments: [mongoose.Types.ObjectId],
    publishedDate: {
        type: Date,
        default: Date.now,
    },
});

const Center=mongoose.model('Center', CenterSchema);
export default Center;