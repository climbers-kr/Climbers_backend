import Center from '../../models/center';
import mongoose from 'mongoose';
const {ObjectId} = mongoose.Types;

/*
*GET /api/centers/:id
* */
export const read=async (req, res)=> {
    const { id }=req.params;

    if(!ObjectId.isValid(id)){
        console.log("getPostById not valid");
        return res.status(400).end();
    }
    try{
        const center=await Center.findById(id);
        //포스트가 존재하지 않을 때
        if(!center) {
            return res.status(404).end("존재하지 않는 포스트 입니다");
        }

        return res.json(center);
    }catch(e){
        res.status(500).send(e);
    }
};

/*
* GET /api/centers?sido=&sigungu=&page=
* */
export const list=async (req, res, next)=> {
    console.log('list api called');
    console.dir(req.query);
    const page=parseInt(req.query.page || '1', 10);

    if(page < 1) {
        return res.status(400).end();
    }

    const {sido, sigungu, search}=req.query;
    //query 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query={
        ...(sido ? {'locationObject.sido': sido}: {}),
        ...(sigungu ? {'locationObject.sigungu': sigungu} : {}),
        ...(search ? {'title': {$regex: search, $options: "i"}} : {}),
    };

    console.log("list query test");
    console.dir(query);

    try{
        const centers=await Center.find(query)
            .sort({_id: -1})
            .limit(10)
            .skip((page-1) * 10)
            .exec();

        const centerCount=await Center.countDocuments(query).exec();
        res.set('Last-Page', Math.ceil(centerCount/10));
        const body=centers
            .map(center=>center.toJSON());


        res.send(body);
    }catch(e){
        return res.status(500).send(e);
    }
};