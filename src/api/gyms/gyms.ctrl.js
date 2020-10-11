import Gym from '../../models/gym';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

/*
*GET /api/gyms/:id
* */
export const read = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    console.log("getPostById not valid");
    return res.status(400).end();
  }
  try {
    const gym = await Gym.findById(id);
    //포스트가 존재하지 않을 때
    if (!gym) {
      return res.status(404).end("존재하지 않는 포스트 입니다");
    }

    return res.json(gym);
  } catch (e) {
    res.status(500).send(e);
  }
};

/*
* GET /api/gyms?sido=&sigungu=&page=
* */
export const list = async (req, res, next) => {
  console.log('list api called');

  const page = parseInt(req.query.page || '1', 10);

  if (page < 1) {
    return res.status(400).end();
  }

  const { sido, sigungu, search } = req.query;
  //query 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
  const query = {
    $and: [
      (sido ? { 'address': { $regex: sido, $options: "i" } } : {}),
      (sigungu ? { 'address': { $regex: sigungu, $options: "i" } } : {}),
    ]
    //...(search ? { 'title': { $regex: search, $options: "i" } } : {}),
  };

  try {
    const gyms = await Gym.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();

    const gymsCount = await Gym.countDocuments(query).exec();

    res.set('Last-Page', Math.ceil(gymsCount / 10));
    const body = gyms
      .map(gym => gym.toJSON())

    res.send(body);
  } catch (e) {
    return res.status(500).send(e);
  }
};