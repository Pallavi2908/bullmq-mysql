import express from "express";
import Redis from "ioredis";
import sharp from "sharp";
import path from "path";
import { Queue, Worker } from "bullmq";
const redis = new Redis({ port: 6379, maxRetriesPerRequest: null });
const PORT = 3000;
const app = express();

const imageQueue = new Queue("image-queue", { connection: redis });
const worker = new Worker(
  "image-queue",
  async (job) => {
    try {
      console.log("We got some job overhere :", job.data);

      const { url } = job.data;
      const outputDir = path.join(process.cwd(), "images"); //ensure you have an 'images' directory set up in root dir of your project
      const outputPath = path.join(outputDir, `${job.id}.jpg`); //output image will be labelled as <job_id>.jpg

      const res = await fetch(url);
      console.log("url to fetch:", res);
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      const image = sharp(buffer);
      const { width } = await image.metadata();

      let targetWidth;
      if (width <= 800) targetWidth = width;
      else if (width <= 1600) targetWidth = 1600;
      else if (width <= 3000) targetWidth = 2000;
      else targetWidth = 2400;

      await image
        .resize({
          width: targetWidth,
          withoutEnlargement: true, //prevent upscaling irrespective of target width
          kernel: sharp.kernel.mks2021, // Magic Kernel Sharp 2021 kernel, with more accurate sharpening
        })
        .jpeg({ quality: 80, mozjpeg: true }) //you can play around with how much of x% quality of the org photo do you want to retain
        .toFile(outputPath);
      return { savedTo: outputPath };
    } catch (error) {
      console.log("Job failed:", error);
      throw error;
    }
  },
  { connection: redis, concurrency: 4 }
);

worker.on("completed", (job) => {
  console.log(`${job.id} has been completed`);
});
worker.on("failed", (job) => {
  console.log(`${job.id} has failed`);
});

imageQueue.addBulk([
  //feel free to add or remove jobs and  the URLs as per your need
  {
    name: "Job1",
    data: {
      url: "https://images.unsplash.com/photo-1764076327046-fe35f955cba1?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    name: "Job2",
    data: {
      url: "https://images.unsplash.com/photo-1761839271800-f44070ff0eb9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    name: "Job3",
    data: {
      url: "https://images.unsplash.com/photo-1763013373779-19e259f95b41?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    name: "Job4",
    data: {
      url: "https://images.unsplash.com/photo-1595768591678-86adb5beac2d?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    name: "Job5",
    data: {
      url: "https://res.cloudinary.com/dfedndfmw/image/upload/v1765608462/Screenshot_915_mi2lc5.png",
    },
  },
]);

app.get("/", (req, res) => {
  res.send("hi helllo!");
});

app.listen(PORT, () => {
  console.log("listening...listening");
});
