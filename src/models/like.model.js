import mongoose from "mongoose";

const likeSchema = new Schema(
    {
        viedo : {
            type : Schema.Types.ObjectId,
            ref : "Viedos"
        },
        Comment: {
            type : Schema.Types.ObjectId,
            ref : "Comment"
        },
        tweet: {
            type : Schema.Types.ObjectId,
            ref : "Tweet"
        },
        likedBy: {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
    },{timestamps: true}
)

export const Like = mongoose.model("Like" , likeSchema)