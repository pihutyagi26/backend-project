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
        throw new ApiError(400, "you can'y subscribe to your own channel")
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
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}