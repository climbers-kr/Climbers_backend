import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const {ObjectId} = mongoose.Types;

export const getPostById=async (ctx, next)=> {
    const {id}=ctx.params;
    if(!ObjectId.isValid(id)){
        console.log("fuck not valid");
        ctx.status=400;
        return;
    }

    try{
        const post=await Post.findById(id);
        //포스트가 존재하지 않을 때
        if(!post) {
            ctx.status=404;
            return;
        }
        ctx.state.post=post;
        return next();
    }catch(e){
        ctx.throw(500, e);
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
        tags: Joi.array()
            .items(Joi.string())
            .required(),
    });

    //검증하고 나서 검증 실패인 경우 에러 처리
    const result=Joi.validate(req.body, schema);
    if(result.error){
        //Bad request
        return res.status(400).send(result.error);
    }

    const {imgUrlList, body, tags}=req.body;
    const post=new Post({
        imgUrlList,
        body,
        tags,
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

export const read=async ctx=> {
    ctx.body=ctx.state.post;
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