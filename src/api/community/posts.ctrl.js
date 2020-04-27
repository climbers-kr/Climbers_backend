import Post from '../../models/post';
import Comment from '../../models/comment';
import mongoose from 'mongoose';
import Joi from 'joi';
const {ObjectId} = mongoose.Types;

export const comment=async (req, res, next)=> {
    console.log('comment called');
    const post=res.locals.post;

    const schema=Joi.object().keys({
        comment: Joi.string().required(),
    });
    //검증하고 나서 검증 실패인 경우 에러 처리
    const result=Joi.validate(req.body, schema);
    if(result.error){
        //Bad request
        return res.status(400).send(result.error);
    }
    const {comment}=req.body;

    const newComment=new Comment({
        commenter: res.locals.user,
        comment,
        post: post._id,
        postId: post._id,
    });
    try{
        await newComment.save();
        await post.addComment({commentId: newComment._id});
        const comments=await Comment.find({'post' : post._id})
            .sort({_id: -1})
            .limit(3)
            .lean()
            .exec();
        return res.send(comments);
    }catch(e){
        console.error(e);
        return res.status(500).send(e);
    }
};

export const getPostById=async (req, res, next)=> {
    const { id } = req.params;
    if(!ObjectId.isValid(id)){
        console.log("ObjectId not valid");
        return res.status(400).end();
    }

    try{
        const post=await Post.findById(id);
        //포스트가 존재하지 않을 때
        if(!post) {
            return res.status(404).end("존재하지 않는 포스트 입니다");
        }
        res.locals.post=post;
        return next();
    }catch(e){
        res.status(500).send(e);
    }

};

//로그인 중인 사용자가 작성한 포스트인지 확인하는 미들웨어
export const checkOwnPost=(ctx, next)=> {
    const {user, post}=ctx.state;
    if(post.user._id.toString() !== user._id) {
        ctx.status=403;
        return;
    }
    return next();
};


/*POST /api/posts
{
    title: '제목',
    body: '내용',
    tags: ['tag1', 'tag2']
}
* */
export const write=async (req, res, next)=> {
    console.log('write api called')

    const schema=Joi.object().keys({
        //객체가 다음 필드를 가지고 있음을 검증
        imgUrlList: Joi.array()
            .items(Joi.string()),
        body: Joi.string().required(),
        category: Joi.string().required(),
        centerTag: Joi.object(),
        tags: Joi.array()
            .items(Joi.string()),

    });

    //검증하고 나서 검증 실패인 경우 에러 처리
    const result=Joi.validate(req.body, schema);
    if(result.error){
        console.error(result.error);
        //Bad request
        return res.status(400).send(result.error);
    }

    const {imgUrlList, body, tags, centerTag, category}=req.body;
    const post=new Post({
        imgUrlList,
        body,
        tags,
        centerTag,
        category,
        user: res.locals.user,
    });

    try{
        await post.save();
        return res.json(post);
    }catch(e){
        return res.status(500).send(e);
    }
}

/*
* GET /api/posts?username=&tag=&page=
* */

export const list=async (req, res, next)=> {
    console.log('list api called');
    console.dir(req.query);
    const page=parseInt(req.query.page || '1', 10);

    if(page < 1) {
        return res.status(400).end();
    }

    const {tag, username, category}=req.query;
    //tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query={
        ...(username ? {'user.username': username}: {}),
        ...(tag ? {tags: tag} : {}),
        ...(category ? {category: category} : {}),
    };

    console.log("list query test");
    console.dir(query);

    try{
        const posts=await Post.find(query)
            .populate('comments')
            .sort({_id: -1})
            .limit(10)
            .skip((page-1) * 10)
            .lean()
            .exec();

        const postCount=await Post.countDocuments(query).exec();
        res.set('Last-Page', Math.ceil(postCount/10));


        res.send(posts);
    }catch(e){

        return res.status(500).send(e);
    }
};

/*
*GET /api/posts/:id
* */
export const read=async (req, res)=> {
    const post=res.locals.post;
    //console.dir(post)
    const query={
        ...(post ? {'postId': post._id}: {}),
    };
    const comments=await Comment.find(query).sort({_id: -1}).find().limit(3).exec();
    //console.dir(JSON.stringify(comments,null,'\t'))
    //console.dir(JSON.stringify(comments))
    const postObject=post.toObject();
    //console.dir(postObject)
    postObject.comments=comments.map(comment=>comment.toObject());
   // console.dir(postObject)
    const body= {

        comments: JSON.stringify(comments),
    }
    //console.dir('body')
    //console.dir(body)
    return res.json(post);
};
export const readComment=async (req, res)=> {
    const post=res.locals.post;
    //console.dir(post)
    const query={
        ...(post ? {'postId': post._id}: {}),
    };
    const comments=await Comment.find(query).sort({_id: -1}).find().limit(3).exec();
    //console.dir(JSON.stringify(comments,null,'\t'))
    //console.dir(JSON.stringify(comments))
    const postObject=post.toObject();
    //console.dir(postObject)
    postObject.comments=comments.map(comment=>comment.toObject());
    // console.dir(postObject)
    const body= {

        comments: JSON.stringify(comments),
    }
    //console.dir('body')
    //console.dir(body)
    return res.json(post);
};
/*
*DELETE /
* */
export const remove=async ctx=> {
    const {id}=ctx.params;
    try{
        await Post.findByIdAndRemove(id).exec();
        ctx.status=204;
    }catch(e){
        ctx.throw(500, e);
    }
};

/*
* PATCH /api/posts/id
* */
export const update=async ctx=> {
    const {id}=ctx.params;

    const schema=Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });

    const result=Joi.validate(ctx.request.body, schema);
    if(result.error) {
        ctx.status=400;
        ctx.body=result.error;
        return;
    }


    try{
        const post=await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true,
        }).exec();
        if(!post) {
            ctx.status=404;
            return;
        }
        ctx.body=post;
    }catch(e){
        ctx.throw(500, e);
    }
};