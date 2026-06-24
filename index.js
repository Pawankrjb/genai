import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const Z_AI_API_KEY = process.env.Z_AI_API_KEY;
if (!Z_AI_API_KEY) {
  throw new Error(
    "Missing Z_AI_API_KEY in environment. Create a .env file or export Z_AI_API_KEY."
  );
}

const SYSTEM_INSTRUCTION =
  "you are my assistant ,you will only answer related to programming and coding related question, Strict rule: you will not answer any question which is not related to programming and coding, if the question is not related to programming and coding then you will say \"Sorry, I can only answer programming and coding related questions.  and answer eveery question in one line only.";

app.use("/static", express.static(path.join(__dirname)));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

app.get("/chat", (_req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message'" });
    }

    const response = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Accept-Language": "en-US,en",
        "Authorization": `Bearer ${Z_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "GLM-4.7-Flash",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: message }
        ],
        stream: false,
        temperature: 1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

