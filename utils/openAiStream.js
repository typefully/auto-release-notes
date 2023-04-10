require("dotenv").config();

const fetch = require("cross-fetch");
const { createParser } = require("eventsource-parser");
const { Readable } = require("stream");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Set up OpenAI streaming

async function openAIStream(payload) {
  const encoder = new TextEncoder();
  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Handle the data received from OpenAI
  const onParse = (event) => {
    if (event.type === "event") {
      const data = event.data;
      if (data === "[DONE]") {
        customReadableStream.push(null);
        return;
      }
      try {
        const json = JSON.parse(data);
        const text = json.choices[0].delta?.content || "";

        if (counter < 2 && (text.match(/\n/) || []).length) {
          return;
        }

        const queue = encoder.encode(text);

        if (!queue) {
          customReadableStream.push(null);
        } else {
          customReadableStream.push(queue);
        }
        counter++;
      } catch (e) {
        console.error(e);
        customReadableStream.push(null);
      }
    }
  };

  const parser = createParser(onParse);

  const customReadableStream = new Readable({
    read() {},
  });

  res.body.setEncoding("utf8");

  res.body.on("data", (chunk) => {
    parser.feed(chunk);
  });

  res.body.on("end", () => {
    parser.feed("", { done: true });
  });

  return customReadableStream;
}

module.exports = openAIStream;
