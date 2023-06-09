import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/firebase";

/**
 * 飲食店のリストを取得するAPI
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentUserId = req.body.currentUserId; //ユーザーID
  const shopId = req.body.shopId; //ショップID

  const docRef = doc(db, "like", currentUserId);

  await updateDoc(docRef, {
    likeShopId: arrayRemove(shopId),
  });

  res.status(200).json({
    message: {
      popup: "お気に入りから削除しました。",
    },
  });
}
