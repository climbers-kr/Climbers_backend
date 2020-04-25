import mongoose from 'mongoose';
const {Schema} = mongoose;

const CommentSchema=new Schema({
    commenter: {
        _id: mongoose.Types.ObjectId,
        username: String,
    },
    comment: {
        type: String,
    },
    subcomments: [mongoose.Types.ObjectId],
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    postId: mongoose.Types.ObjectId,
    publishedDate: {
        type: Date,
        default: Date.now,
    },

});
/*
CommentSchema.statics.findByPostId=function(postId){

    return this.find({postId});
};*/
const Comment=mongoose.model('Comment', CommentSchema);
export default Comment;