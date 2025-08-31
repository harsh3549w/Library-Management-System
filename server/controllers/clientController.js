import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { getClientImagesFromCloudinary } from "../utils/clientUploader.js";

export const getClientImages = catchAsyncErrors(async (req, res, next) => {
  const imageUrls = await getClientImagesFromCloudinary();

  res.status(200).json({
    success: true,
    images: imageUrls,
  });
});
