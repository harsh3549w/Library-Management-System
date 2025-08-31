import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { uploadClientImages } from "../utils/clientUploader.js";

export const getClientImages = catchAsyncErrors(async (req, res, next) => {
  try {
    const imageUrls = await uploadClientImages();
    
    res.status(200).json({
      success: true,
      images: imageUrls
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to fetch client images", 500));
  }
});
