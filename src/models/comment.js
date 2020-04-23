import mongoose from 'mongoose';
const {Schema} = mongoose;

const CommentSchema=new Schema({
    user: {
        _id: mongoose.Types.ObjectId,
        username: String,
    },
    body: String,
    subcomments: [mongoose.Types.ObjectId],
    postId: mongoose.Types.ObjectId,
    publishedDate: {
        type: Date,
        default: Date.now,
    },

});

const Comment=mongoose.model('Comment', CommentSchema);
export default Comment;