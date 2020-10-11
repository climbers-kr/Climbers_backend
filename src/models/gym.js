import mongoose from 'mongoose';
const { Schema } = mongoose;
const priceSchema = new Schema({
    period: String,
    price: String,
});
const facilitySchema = new Schema({
    bouldering: Boolean,
    endurance: Boolean,
    lead: Boolean,
    speed: Boolean,
    outside: Boolean,
});
const bizHourSchema = new Schema({
    type: String,
    startTime: String,
    endTime: String,
    isDayOff: Boolean,
    description: String,
});
const GymSchema = new Schema({
    dataId: String, //크롤링 해온 데이터 id
    imgUrlList: [String],
    name: String,
    address: String,
    addressAbbr: String,
    roadAddr: Object,
    locationObject: Object,
    coordinate: Object,
    homepages: [Object],
    prices: [priceSchema],
    phone: String,
    bizHour: [bizHourSchema],
    keywords: [String],
    detailedDescription: String,
    roadDescription: String,
    hasParking: Boolean,
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

const Gym = mongoose.model('Gym', GymSchema);
export default Gym;