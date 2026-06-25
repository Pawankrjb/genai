import { GoogleGenAI } from "@google/genai";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import 'dotenv/config'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Check your .env file.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const rl = readline.createInterface({ input, output });

async function cryptocurrency(coin) {
    const coinId = coin.toLowerCase().replace(/\s+/g, '-');

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}`
    );

    const data = await response.json();
    return data;
}

async function weather(city){
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=d6a3bcd7a43c4ed59c2155208252404&q=${city}&aqi=no`);
    const data = await response.json();
    return data;
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "cryptocurrency",
        description: "Get information about a specific cryptocurrency.",
        parameters: {
          type: "OBJECT",
          properties: {
            coin: {
              type: "STRING",
              description: "The name of the cryptocurrency.",
            },
          },
          required: ["coin"],
        },
      },
      {
        name: "weather",
        description: "Get the current weather for a specific city.",
        parameters: {
          type: "OBJECT",
          properties: {
            city: {
              type: "STRING",
              description: "The name of the city.",
            },
          },
          required: ["city"],
        },
      },
    ],
  },
];

async function runagent() {
  const history = [];

  while (true) {
    const userInput = await rl.question("User: ");

    if (userInput.toLowerCase() === "exit") {
      break;
    }

    history.push({
      role: "user",
      parts: [{ text: userInput }],
    });

    let result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: { tools },
    });

    while (result.functionCalls && result.functionCalls.length > 0) {
      const functionCall = result.functionCalls[0];
      const { name, args } = functionCall;

      let toolResult;

      if (name === "cryptocurrency") {
        toolResult = await cryptocurrency(args.coin);
      } else if (name === "weather") {
        toolResult = await weather(args.city);
      } else {
        throw new Error(`Unknown function call: ${name}`);
      }

      history.push({
        role: "model",
        parts: [{ functionCall }],
      });

      history.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name,
              response: toolResult,
            },
          },
        ],
      });

      result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: { tools },
      });
    }

    if (result.text) {
      console.log("Assistant:", result.text);

      history.push({
        role: "model",
        parts: [{ text: result.text }],
      });
    }
  }

  rl.close();
}

runagent().catch((err) => {
  console.error("Error:", err);
});