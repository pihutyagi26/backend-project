import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    //Searching videos by title or description.
    //Showing videos uploaded by a particular user.
    //Sorting videos by newest, views, or title.
    // Displaying videos page by page instead of loading everything at once.
    const {
        page = 1,
        limit = 10,
        query,
        sortBy,
        sortType,
        userId
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(
        1,
        Math.min(100, parseInt(limit, 10) || 10)
    );

    const filter = {
        isPublished: true
    };

    if (query?.trim()) {
        const searchRegex = query.trim().replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        filter.$or = [
            { title: { $regex: searchRegex, $options: "i" } },
            { description: { $regex: searchRegex, $options: "i" } }
        ];
    }

    if (userId) {
        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        filter.owner = userId;
    }

    const allowedSortFields = ["createdAt", "views", "title"];
    const field = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";

    const order = sortType === "asc" ? 1 : -1;
    const sort = { [field]: order };

    const videos = await Video.find(filter)
        .populate("owner", "username fullName avatar")
        .sort(sort)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                totalVideos,
                totalPages: Math.ceil(totalVideos / limitNumber),
                currentPage: pageNumber,
                limit: limitNumber
            },
            "Videos fetched successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required")
    }
    const videoPath = req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (!videoPath) {
        throw new ApiError(400, "video path not found ")
    }
    if (!thumbnailPath) {
        throw new ApiError(400, "thumbnail path not found ")
    }

    const uploadedVideo = await uploadOnCloudinary(videoPath)

    if (!uploadedVideo?.url) {
        throw new ApiError(500, "Can't upload viedo on cloudinary")
    }

    const uploadededThumbnail = await uploadOnCloudinary(thumbnailPath)

    if (!uploadededThumbnail?.url) {
        throw new ApiError(500, "Can't upload thumbnail on cloudinary")
    }

    // 5. Save video details in MongoDB

    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadededThumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: Number(uploadedVideo.duration ?? 0),
        owner: req.user._id
    });
    // 6. Fetch the created video with owner details
    const createVideo = await Video.findById(video._id)
        .populate("owner", "username fullName avatar");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createVideo, "Video published successfully"
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    }).populate("owner", "username fullName avatar")

    if (!video) {
        throw new ApiError(400, " video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "video fetched successfully"
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "you are not allowed to update the viedo")
    }

    if (title !== undefined) {
        if (!title.trim()) {
            throw new ApiError(400, "Title cannot be empty")
        }
        video.title = title.trim()
    }
    if (description !== undefined) {
        if (!description.trim()) {
            throw new ApiError(400, "Description can't be empty")
        }
        video.description = description.trim();
    }

    const thumbnailPath = req.file?.path
    if (thumbnailPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail)

        if (!uploadedThumbnail.url) {
            throw new ApiError(500, "Thumbnail upload failed")
        }
        video.thumbnail = uploadedThumbnail.url
    }

    await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                Video, "video updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Inavalid video id")
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "video doesn't exist")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, " You are not allowed to delete this viedo")
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "video deleted successfully")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to change this video's publish status"
        );
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video ${video.isPublished ? "published" : "unpublished"} successfully`
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
