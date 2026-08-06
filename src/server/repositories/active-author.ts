import type { PipelineStage } from "mongoose";

/**
 * @file active-author.ts
 * @description Yazarı hesabını kapatmış satırları eleyen ortak aggregate adımları.
 *
 * Beğeni ve yorum SAYILARI, gösterilen listeyle uyuşmak zorunda: kapatılmış bir
 * hesabın yorumu listede görünmezken sayıda görünürse ekran bozuk görünür.
 * Aynı üç adım iki repository'de de gerektiği için burada toplandı.
 *
 * `users` koleksiyon adı Mongoose'un `User` modelinden ürettiği addır.
 */
export const ACTIVE_AUTHOR_STAGES: PipelineStage[] = [
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "activeAuthor",
      pipeline: [{ $match: { closedAt: { $exists: false } } }, { $project: { _id: 1 } }],
    },
  },
  { $match: { "activeAuthor.0": { $exists: true } } },
];
