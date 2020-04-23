import mongoose from 'mongoose';
const {Schema} = mongoose;

const PostSchema=new Schema({
    imgUrlList: [String],
    body: String,
    tags: [String],
    category: String, //정보, 문제, 일상, 유머
    centerTag: mongoose.Types.ObjectId,
    likes: [mongoose.Types.ObjectId],
    comments: [mongoose.Types.ObjectId],
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

const Post=mongoose.model('Post', PostSchema);
export default Post;