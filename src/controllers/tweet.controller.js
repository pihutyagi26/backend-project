import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    const owner = req.user._id

    if (!content?.trim()) {
        throw new ApiError(400, "Content can't be empty")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: owner
    })

    return res.status(201).json(new ApiResponse(201, tweet, "tweet added successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "user not found")
    }

    const tweets = await Tweet.find({
        owner: userId
    })

    return res.status(200).json(
        new ApiResponse(200, tweets, "tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body;
    const { tweetId } = req.params

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "TweetId is not valid")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404,  "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not allowed to change this tweet")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content can't be empty");
    }

    tweet.content = content.trim();

    const updatedTweeet = await tweet.save()

    return res.status(200).json(
        new ApiResponse(200, updatedTweeet, "tweet updated")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId} = req.params;

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "TweetId is not valid")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
    throw new ApiError(404, "Tweet not found");
}

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "you are not allowed to delete this tweet")
    }

    await  tweet.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "tweet deleted")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}