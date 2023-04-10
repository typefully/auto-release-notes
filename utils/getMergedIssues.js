require("dotenv").config();

const { LinearClient, LinearDocument, Issue, Project } = require("@linear/sdk");
const dayjs = require("dayjs");
const chalk = require("chalk");

const isMerged = require("./isMerged");

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || "";

const linearClient = new LinearClient({
  apiKey: LINEAR_API_KEY,
});

// Fetch and format completed issues from the past week

async function getMergedIssues(type) {
  const now = dayjs();
  let updatedAtAfter;

  switch (type) {
    case "curr-week":
      updatedAtAfter = now.startOf("week").toISOString();
      break;
    case "prev-week":
      updatedAtAfter = now.subtract(1, "week").startOf("week").toISOString();
      break;
    case "curr-month":
      updatedAtAfter = now.startOf("month").toISOString();
      break;
    case "prev-month":
      updatedAtAfter = now.subtract(1, "month").startOf("month").toISOString();
      break;
    case "last-7-days":
    default:
      updatedAtAfter = now.subtract(7, "day").toISOString();
      break;
  }

  const issues = await linearClient.issues({
    orderBy: LinearDocument.PaginationOrderBy.UpdatedAt,
    filter: {
      completedAt: { gte: updatedAtAfter },
    },
  });

  // Filter issues that have been merged in production by
  // checking if they have a GitHub attachment with the
  // production branch name in the subtitle

  console.log(chalk.blue(`Finding merged issues...`));

  const mergedIssues = (
    await Promise.all(
      issues.nodes.map(async (issue) => {
        const attachments = await issue.attachments();

        // Check if there's a GitHub attachment
        const githubAttachment = attachments.nodes.find((attachment) =>
          attachment.url.includes("https://github.com/")
        );

        if (!githubAttachment) {
          return null;
        }

        // Check if the commit has been merged
        const merged = await isMerged(githubAttachment.url);

        if (merged) {
          console.log(chalk.bold(chalk.green(`✓ ${issue.title}`)));
        }

        return merged ? issue : null;
      })
    )
  ).filter((issue) => issue);

  console.log();
  if (mergedIssues.length > 0) {
    console.log(chalk.bold(`Found ${mergedIssues.length} completed issues`));
  } else {
    console.log(chalk.bold(`No completed issues found`));
    return null;
  }

  // Format issue details and generate task summaries
  let issueText = await Promise.all(
    mergedIssues.map(async (issue) => {
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
        .split(`\`\`\``)[0]
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

module.exports = getMergedIssues;
