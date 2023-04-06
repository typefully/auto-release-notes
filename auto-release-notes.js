require("dotenv").config();

const { LinearClient, LinearDocument } = require("@linear/sdk");
const dayjs = require("dayjs");
const fetch = require("cross-fetch");
const { createParser } = require("eventsource-parser");
const { Readable } = require("stream");
const chalk = require("chalk");
const fs = require("fs");

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const linearClient = new LinearClient({
  apiKey: LINEAR_API_KEY,
});

async function getCompletedIssues() {
  const oneWeekAgo = dayjs().subtract(7, "day").toISOString();
  const issues = await linearClient.issues({
    orderBy: LinearDocument.PaginationOrderBy.UpdatedAt,
    updatedAtAfter: oneWeekAgo,
    filter: {
      completedAt: { null: false },
      project: { null: true },
    },
  });

  console.log(chalk.green(`○ Found ${issues.nodes.length} completed issues`));

  let issueText = await Promise.all(
    issues.nodes.map(async (issue) => {
      const labels = await issue.labels();
      const labelsString =
        labels.nodes.length > 0
          ? "Tags: " + labels.nodes.map((label) => label.name).join(", ") + "\n"
          : "";
      
      const description = ((issue.description || "").split(". ").slice(0, 2).join(". ").split("![")[0].slice(0, 120)).trim();

      return `# ${issue.title}
${labelsString}
${(description.startsWith("!") || description.startsWith("[")) ? "" : description}`.trim();
    })
  );

  issueText = issueText.join("\n\n---\n\n");

  return issueText;
}

async function OpenAIStream(payload) {
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

async function requestSummary(issueText) {
  try {
    const messages = [
      { role: "system", content: "You are an expert writing assistant." },
      {
        role: "user",
        content: `I work at Typefully and these are all the tasks we've completed in the last 7 days:

${issueText}

Can you please write a great release-notes.md file for me from the above tasks?

You can use these ## headlines, if you find related completed tasks:

* New Features
* Improvements
* Fixes

After each headline, you can add the * list of completed issues, nicely written. 

Feel free to use **bold text** at the start of the issue if you think it's important, but not for Fixes.

Add a brief introduction to give a gift or overall theme of this week releases. No "welcome" or unnecessary text, always go straight to the point.

If you don't include something in the changelog (like internal fixes or things you don't understand), append it at the end of the file after a --- separator.

Please now reply directly with the generated release-notes.md content`,
      },
    ];

    const payload = {
      model: "gpt-4",
      messages: messages,
      temperature: 0.7,
      stream: true,
    };

    const summaryStream = await OpenAIStream(payload);

    console.log(chalk.blue("↩ Generating summary..."));

    let summary = "";

    for await (const chunk of summaryStream) {
      const textChunk = chunk.toString();
      summary += textChunk;
      process.stdout.write(textChunk);
    }

    const currentDate = dayjs().format("YYYY-MM-DD");
    const fileName = `release-notes-${currentDate}.md`;

    fs.writeFileSync(fileName, summary);
    console.log(chalk.green(`\n✅ ${fileName} file created/updated`));
  } catch (error) {
    console.error(chalk.red("Error while generating summary:"), error);
  }
}

getCompletedIssues()
  .then((issueText) => {
    requestSummary(issueText);
  })
  .catch((error) => {
    console.error(chalk.red("Error while fetching issues:"), error);
  });
