import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    const subscriber = req.user._id;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid id")
    }

    if (subscriber.toString() === channelId.toString()) {
        throw new ApiError(400, "you can't subscribe to your own channel")
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "no channel found")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res.status(200).json(
            new ApiResponse(200, {}, " unsubscribed successfully")
        )
    }

    const newSubscription = await Subscription.create({
        subscriber: subscriber,
        channel: channelId
    });

    return res.status(201).json(
        new ApiResponse(201, newSubscription, "subscribed successfully")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Inavlid id")
    }

    const subscriber = await Subscription.find({
        channel : channelId
    }).populate("subscriber","username fullnName avatar")

    return res.status(200).json(
        new ApiResponse(200,subscriber, "Subscriber fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    console.log("Route params:", req.params);
    const { subscriberId } = req.params
    

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400,"Inavlid subscriber id")
    }

    const subscribed = await Subscription.find({
        subscriber : subscriberId
    }).populate("channel" , "username fullName avatar")

    return res.status(200).json(
        new ApiResponse(
            200, subscribed,"subscribed channel fetched"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}