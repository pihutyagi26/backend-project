import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(
        1,
        Math.min(100, parseInt(limit, 10) || 10)
    );

    const skip = (pageNumber - 1) * limitNumber;

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)

    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limitNumber);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    comments,
                    totalComments,
                    totalPages,
                    currentPage: pageNumber,
                    limit: limitNumber
                },
                "Comments fetched successfully")
        )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content can't be empty")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "video doesn't exist")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner :req.user._id
    }
    )
    if(!comment){
        throw new ApiError(500, "can't add comment")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, comment, "Comment added ")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment Id");
    }
    if(!content?.trim()){
        throw new ApiError(400, "comment content required")
    }

    const comment = await Comment.findById(commentId)
    if(!comment ){
        throw new ApiError(404, "Comment not found")
    }
   if(comment.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403, "You are not allowed to change the comment")
   }
    comment.content = content.trim();

   await comment.save()

   return res
   .status(200)
   .json(
    new ApiResponse(200, comment , "comment updated successfully")
   )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Inavlid ci-omment id")
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment doesn't exist")
    }
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed to delete the comment")
    }

    await Comment.findByIdAndDelete(commentId);

    return res 
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}