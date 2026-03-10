const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/generate-emoji", async (req, res) => {
  const { baseEmoji, prompt } = req.body;

  try {
    const fullPrompt = `
Create a single tiny custom emoji/sticker icon inspired by "${baseEmoji}".
Style: simple, clean, centered, transparent background, square composition, emoji-like.
User idea: ${prompt}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: fullPrompt
    });

    let imageData = null;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageData) {
      return res.status(500).json({
        error: "No image was returned by Gemini."
      });
    }

    res.json({ imageData });
  } catch (error) {
    console.error("Gemini generation error:", error);
    res.status(500).json({
      error: "Failed to generate emoji image."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});