import { Message } from '../models/Message.js';

export async function conversation(req, res, next) {
  try {
    const { otherUserId } = req.params;
    const me = req.user._id;
    const list = await Message.find({
      $or: [
        { fromUserId: me, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: me },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(500);
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function inbox(req, res, next) {
  try {
    const me = req.user._id;
    const recent = await Message.aggregate([
      {
        $match: {
          $or: [{ fromUserId: me }, { toUserId: me }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$fromUserId', me] }, '$toUserId', '$fromUserId'],
          },
          last: { $first: '$$ROOT' },
        },
      },
      { $limit: 50 },
    ]);
    res.json(recent.map((r) => r.last));
  } catch (e) {
    next(e);
  }
}
