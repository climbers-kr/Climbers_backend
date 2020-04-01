import mongoose from 'mongoose';

const {Schema} = mongoose;

const TestSchema=new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imgCollection: {
        type: Array
    },
});

const Test=mongoose.model('Test', TestSchema);
export default Test;