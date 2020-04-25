import mongoose from 'mongoose';
const {Schema} = mongoose;

const PostSchema=new Schema({
    imgUrlList: [String],
    body: String,
    tags: [String],
    category: String, //정보, 문제, 일상, 유머
    centerTag: mongoose.Types.ObjectId,
    likes: [mongoose.Types.ObjectId],
    //comments: [mongoose.Types.ObjectId],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    solvedPeople: [mongoose.Types.ObjectId],
    publishedDate: {
        type: Date,
        default: Date.now,
    },
    user: {
        _id: mongoose.Types.ObjectId,
        username: String,
    },
});
PostSchema.methods.addComment = async function ({commentId}) {
    this.comments.push(commentId);
    if(this.comments.length >3){
        this.comments.splice(0,this.comments.length-3); //최근 3개의 댓글만 저장
    }
    return this.save();
};
const Post=mongoose.model('Post', PostSchema);
export default Post;