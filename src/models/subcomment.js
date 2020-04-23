import mongoose from 'mongoose';
const {Schema} = mongoose;

const SubcommentSchema=new Schema({
    user: {
        _id: mongoose.Types.ObjectId,
        username: String,
    },
    body: String,
    commentId: [mongoose.Types.ObjectId],
    postId: mongoose.Types.ObjectId,
    publishedDate: {
        type: Date,
        default: Date.now,
    },

});

const Subcomment=mongoose.model('Subcomment', SubcommentSchema);
export default Subcomment;