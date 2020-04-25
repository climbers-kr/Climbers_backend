import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const {ObjectId} = mongoose.Types;

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
export const write=async ctx=> {
    const schema=Joi.object().keys({
        title: Joi.string().required(),
        body: Joi.string().required(),
        tags: Joi.array()
            .items(Joi.string())
            .required(),
    });

    const result=Joi.validate(ctx.request.body, schema);
    if(result.error) {
        ctx.status=400; //bad request
        ctx.body=result.error;
        return;
    }
    const {title, body, tags}=ctx.request.body;
    const post=new Post({
        title,
        body,
        tags,
        user: ctx.state.user,
    });

    try{
        await post.save();
        ctx.body=post;
    }catch(e){
        ctx.throw(500, e);
    }
};

/*
* GET /api/posts?username=&tag=&page=
* */

export const list=async ctx=> {

    const page=parseInt(ctx.query.page || '1', 10);

    if(page < 1) {
        ctx.status=400;
        return;
    }

    const {tag, username}=ctx.query;
    //tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query={
        ...(username ? {'user.username': username}: {}),
        ...(tag ? {tags: tag} : {}),
    };

    console.log("list query test");
    console.dir(query);


    try{
        const posts=await Post.find(query)
            .sort({_id: -1})
            .limit(10)
            .skip((page-1) * 10)
            .exec();
        const postCount=await Post.countDocuments(query).exec();
        ctx.set('Last-Page', Math.ceil(postCount/10));
        ctx.body=posts
            .map(post=>post.toJSON())
            .map(post=> ({
                ...post,
                body:
                post.body.length < 200 ? post.body: `${post.body.slice(0, 200)}...`,
            }));
    }catch(e){
        ctx.throw(500, e);
    }
};

/*
*GET /api/posts/:id
* */
export const read=async (req, res)=> {
    const post=res.locals.post;
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