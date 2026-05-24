import { Request, Response } from "express";
import { extractText } from "../services/extractTextService";
import { aiResponse } from "../services/aiService";
import { cloudinary } from "../services/importService";

export const analyzeCVController = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const extractedText = await extractText(file.path, file.mimetype);
    const {
      score,
      sectionsToImprove,
      positiveFeedback,
      neutralFeedback,
      negativeFeedback,
      interviewQuestions
    } = await aiResponse(extractedText);

    res.status(200).json({
      message: "CV analyzed successfully",
      originalFile: {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        path: file.path
      },
      extractedText,
      atsScore: score,
      sectionsToImprove: sectionsToImprove,
      positiveFeedback,
      neutralFeedback,
      negativeFeedback,
      interviewQuestions
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ message: "Failed to analyze CV", error });
  } finally {
    if (file && file.filename) {
      try {


        await cloudinary.uploader.destroy(file.filename, { resource_type: "raw" });
      } catch (err) {
        console.error("Failed to delete file from Cloudinary:", err);
      }
    }
  }
};
