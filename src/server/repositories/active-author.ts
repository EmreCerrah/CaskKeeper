import type { PipelineStage } from "mongoose";

/**
 * @file active-author.ts
 * @description The shared aggregate stages that drop rows whose author has
 * closed their account.
 *
 * Like and comment COUNTS have to agree with the list beside them: if a closed
 * account's comment is missing from the list but still counted, the screen
 * looks broken. The same three stages were needed in two repositories, so they
 * live here.
 *
 * The `users` collection name is the one Mongoose derives from the `User`
 * model.
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
