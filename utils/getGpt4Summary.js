require("dotenv").config();

const dayjs = require("dayjs");
const chalk = require("chalk");
const fs = require("fs");

const openAiStream = require("./openAiStream");

/* ------------- Generate the release notes markdown with GPT-4 ------------- */

async function getGpt4Summary(issueText) {
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

Make sure each task is nicely written, clear, and very concise (don't just repeat the task title). Never include links or tags. Remember that an issue title could be referencing to the problem, not the solution, but the release notes should be written from the solution point of view.

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
      temperature: 0.7,
      stream: true,
    };

    const summaryStream = await openAiStream(payload);

    console.log();
    console.log(chalk.blue("↩ Generating summary..."));

    let summary = "";

    for await (const chunk of summaryStream) {
      const textChunk = chunk.toString();
      summary += textChunk;
      process.stdout.write(textChunk);
    }

    return summary;
  } catch (error) {
    console.error(chalk.red("Error while generating summary:"), error);
  }
}

module.exports = getGpt4Summary;
