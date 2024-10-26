import Video from '../models/Video.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import axios from "axios";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyA6hp0IYDZBz9tc7m3-VMn9rSRG_mlZQSE");

// Converts file information to a GoogleGenerativeAI.Part object.
const fileToGenerativePart = async (pathOrUrl, mimeType) => {
  if (pathOrUrl.startsWith("http")) {
    // Remote image
    const response = await axios.get(pathOrUrl, { responseType: "arraybuffer" });
    const data = Buffer.from(response.data, "binary").toString("base64");
    return {
      inlineData: {
        data,
        mimeType,
      },
    };
  } else {
    // Local image
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(pathOrUrl)).toString("base64"),
        mimeType,
      },
    };
  }
};

export const createVideo = async (req, res, next) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    res.status(400);
    return next(new Error("imgUrl required"));
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt =
      "Answer the following questions: 1) What are the services provided by the company?, 2) What is the text displayed? 3) Is the majority of the text displayed on a card or vehicle or poster or construction site?";

    const imagePart = await fileToGenerativePart(imageUrl, "image/jpeg"); // Use the imageUrl from the request

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    // Split the text into three statements
    const statements = text.split("\n").map((statement) => statement.trim());

    // Remove statement numbers and format the output
    const [Services, Result, Type] = statements.map(
      (statement) =>
        statement
          .replace(/^\d+\)\s/, "") // Remove statement number and trailing space
          .replace(/\.$/, "") // Remove trailing period
          .trim() // Trim any extra spaces
    );
    // console.log(Type);

    // Your existing Video creation logic here
    const video = await Video.create({
      imageUrl,
      Type,
      Result,
      Services
    });
    // console.log(imageUrl);
    // console.log(videoUrl);
  } catch (error) {
    console.log(error);
    res.status(500);
    next(error);
  }
};

export const getData = async (req,res)=>{
  try{
    const getAllData = await Video.find();
    res.json(getAllData);
  }catch(error){  
    console.error(error);
    res.status(500).json({error:"Internal Server Error"});
  }
}

export const getAData = async (req, res) => {
  const { id } = req.params;
  try {
    const getSingleData = await Video.findById(id);

    if (!getSingleData) {
      res.status(404).json({ msg: "Document not found" });
      return;
    }

    res.json(getSingleData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


export const deleteData = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedData = await Video.findByIdAndDelete(id);

    if (!deletedData) {
      // If no document was found and deleted
      res.status(404).json({ msg: "Document not found" });
      return;
    }

    res.status(200).json({ msg: "Successfully deleted", deletedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


export const updateData = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = await Video.findByIdAndUpdate(id,{
      imageUrl:req?.body?.imageUrl,
      Services:req?.body?.Services,
      Type:req?.body?.Type,
    },
  {
    new:true,
  });

    if (!updateData) {
      // If no document was found and deleted
      res.status(404).json({ msg: "Document not found" });
      return;
    }

    res.status(200).json({ msg: "Successfully deleted", updateData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


