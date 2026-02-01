import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";
import fs from "fs";
import path from "path";
import ai from "../configs/ai.js";
import axios from "axios";

/* ---------------------------------- helpers ---------------------------------- */

const loadImageAsBase64 = (filePath: string, mimeType: string) => ({
  inlineData: {
    data: fs.readFileSync(filePath).toString("base64"),
    mimeType,
  },
});

const getAuthUserId = (req: Request, res: Response): string | null => {
  const auth = req.auth?.();
  if (!auth?.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return auth.userId;
};

/* -------------------------------- create project ------------------------------ */

export const createProject = async (req: Request, res: Response) => {
  console.log("AUTH:", req.auth?.());
  console.log("FILES:", req.files);

  let projectId: string | null = null;
  let creditsDeducted = false;

  try {
    /* ---------- auth ---------- */
    const userId = getAuthUserId(req, res);
    if (!userId) return;

    /* ---------- body ---------- */
    const {
      name = "New Project",
      aspectRatio = "9:16",
      userPrompt = "",
      productName,
      productDescription = "",
      targetLength = 5,
    } = req.body;

    if (!productName) {
      return res.status(400).json({ message: "Product name is required" });
    }

    /* ---------- files ---------- */
    const files = req.files as {
      productImage?: Express.Multer.File[];
      modelImage?: Express.Multer.File[];
    };

    if (!files?.productImage?.[0] || !files?.modelImage?.[0]) {
      return res.status(400).json({
        message: "Both product image and model image are required",
      });
    }

    const productImage = files.productImage[0];
    const modelImage = files.modelImage[0];

    /* ---------- user & credits ---------- */
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.credits < 5) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    });

    creditsDeducted = true;

    /* ---------- upload reference images ---------- */
    const [productImageUrl, modelImageUrl] = await Promise.all([
      cloudinary.uploader.upload(productImage.path, {
        resource_type: "image",
      }),
      cloudinary.uploader.upload(modelImage.path, {
        resource_type: "image",
      }),
    ]);

    /* ---------- create project ---------- */
    const project = await prisma.project.create({
      data: {
        name,
        userId,
        productName,
        productDescription,
        userPrompt,
        aspectRatio,
        targetLength: Number(targetLength) || 5,
        uploadedImages: [productImageUrl.secure_url, modelImageUrl.secure_url],
        isGenerating: true,
      },
    });

    projectId = project.id;

    /* ---------- AI image generation ---------- */
    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize: "1K",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.OFF,
        },
      ],
    };

    const contents = [
      loadImageAsBase64(productImage.path, productImage.mimetype),
      loadImageAsBase64(modelImage.path, modelImage.mimetype),
      {
        text: `Create a photorealistic e-commerce image showing a person naturally interacting with the product. Match lighting, shadows, scale, and perspective. ${userPrompt}`,
      },
    ];

    const aiResponse: any = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents,
      config: generationConfig,
    });

    const imagePart = aiResponse?.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData,
    );

    if (!imagePart) {
      throw new Error("Image generation failed");
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");

    const generated = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBuffer.toString("base64")}`,
      { resource_type: "image" },
    );

    await prisma.project.update({
      where: { id: projectId },
      data: {
        generatedImage: generated.secure_url,
        isGenerating: false,
      },
    });

    res.status(201).json({ projectId });
  } catch (error: any) {
    console.error(error);

    if (projectId) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          isGenerating: false,
          error: error.message,
        },
      });
    }

    if (creditsDeducted) {
      await prisma.user.update({
        where: { id: req.auth?.()?.userId },
        data: { credits: { increment: 5 } },
      });
    }

    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

/* ------------------------------ create video ---------------------------------- */

export const createVIdeo = async (req: Request, res: Response) => {
  let creditsDeducted = false;

  try {
    const userId = getAuthUserId(req, res);
    if (!userId) return;

    const { projectId } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < 10) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 10 } },
    });
    creditsDeducted = true;

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!project || project.isGenerating || !project.generatedImage) {
      return res.status(400).json({ message: "Invalid project state" });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { isGenerating: true },
    });

    const image = await axios.get(project.generatedImage, {
      responseType: "arraybuffer",
    });

    let operation: any = await ai.models.generateVideos({
      model: "gemini-2.5-flash-video",
      prompt: `Showcase the product ${project.productName} naturally and professionally.`,
      image: {
        imageBytes: Buffer.from(image.data).toString("base64"),
        mimeType: "image/png",
      },
      config: {
        aspectRatio: project.aspectRatio || "9:16",
        numberOfVideos: 1,
        resolution: "720p",
      },
    });

    while (!operation.done) {
      await new Promise((r) => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoFile = operation.response?.generatedVideo?.[0]?.video;
    if (!videoFile) {
      throw new Error("Video generation failed");
    }

    fs.mkdirSync("videos", { recursive: true });
    const filePath = path.join("videos", `${projectId}.mp4`);

    await ai.files.download({
      file: videoFile,
      downloadPath: filePath,
    });

    const uploaded = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        generatedVideo: uploaded.secure_url,
        isGenerating: false,
      },
    });

    fs.unlinkSync(filePath);

    res.json({ videoUrl: uploaded.secure_url });
  } catch (error: any) {
    if (creditsDeducted) {
      await prisma.user.update({
        where: { id: req.auth?.()?.userId },
        data: { credits: { increment: 10 } },
      });
    }

    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        isPublished: true,
      },
    });
    res.json({ projects });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
export const deleteProject = async (
  req: Request<{ projectId: string }>,
  res: Response,
) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
    res.json({ message: "Project Deleted" });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
