import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc

    const totalVideos = await Video.countDocuments({
        owner: req.user._id
    })

    const viewsData = await Video.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }

            }
        }
    ])

    const totalViews = viewsData[0]?.totalViews || 0;

    const subscriberCount = await Subscription.countDocuments({
        channel: req.user._id
    });

    const channelVideos = await Video.find({
        owner: req.user._id
    }).select("_id");

    const videoIds = channelVideos.map(video => video._id);

    const totalLikes = await Like.countDocuments({
        video: {
            $in: videoIds
        }
    });

    return res.status(200)
        .json(new ApiResponse(
            200, {
            totalVideos,
            totalLikes,
            totalViews,
            subscriberCount
        },
            "Channel stats fetched successfully"

        ))
})
const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const getChannelVideos = asyncHandler(async (req, res) => {
        const videos = await Video.find({
            owner: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            )
        );
    })
})

    export {
        getChannelStats,
        getChannelVideos
    }