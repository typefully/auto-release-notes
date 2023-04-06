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

/* ---------- Fetch and format completed issues from the past week ---------- */

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

  // Format issue details and generate task summaries
  let issueText = await Promise.all(
    issues.nodes.map(async (issue) => {
      // Format each issue labels
      const labels = await issue.labels();
      const labelsString =
        labels.nodes.length > 0
          ? "Tags: " + labels.nodes.map((label) => label.name).join(", ") + "\n"
          : "";

      // Format issue description
      const description = issue.description || "";
      const cleanedDescription = description
        .split(". ")
        .slice(0, 2)
        .join(". ")
        .split("![")[0]
        .slice(0, 120)
        .trim();

      const filteredDescription =
        cleanedDescription.startsWith("!") || cleanedDescription.startsWith("[")
          ? ""
          : cleanedDescription;

      return `# ${issue.title}
${labelsString}${filteredDescription}`.trim();
    })
  );

  issueText = issueText.join("\n\n---\n\n");

  return issueText;
}

/* ------------------------- Set up OpenAI streaming ------------------------ */

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

/* ------------- Generate the release notes markdown with GPT-4 ------------- */

async function requestSummary(issueText) {
  try {
    const messages = [
      {
        role: "system",
        content: "You are an expert team assistant and writer.",
      },
      {
        role: "user",
        content: `These are all the tasks we've completed in the last 7 days:

${issueText}

Can you please write a great release-notes.md file for me from the above tasks?

You can use these ## headlines, if you find related completed tasks:

* New Features
* Improvements
* Fixes

For "New Features" you can add a separate ### title for each new feature you've found.

For "Improvements" and "Fixes", you can directly write a * bullet list of completed tasks. 

Make sure each task is nicely written, clear, and very concise (don't just repeat the task title). Never include links or tags.

Feel free to use **bold text** at the start of the issue if you think it's important, but not for Fixes.

If you don't include something in the changelog (because you think it's an internal fix or it contains sensitive information), append it at the end of the file after a --- separator and an "Excluded" title. 

Try your best to not write more than 500 words (for example fixes can be more concise than features and improvements).

If you spot major improvements or a common theme in the tasks, write a brief introduction at the start. No "welcome" or unnecessary text, go straight to the point.

Please now reply directly with the generated release-notes.md content`,
      },
    ];

    const payload = {
      model: "gpt-4",
      messages: messages,
      temperature: 0.6,
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

console.clear();

getCompletedIssues()
  .then((issueText) => {
    requestSummary(issueText);
  })
  .catch((error) => {
    console.error(chalk.red("Error while fetching issues:"), error);
  });
