const chalk = require("chalk");

const getMergedIssues = require("./utils/getMergedIssues");
const getGpt4Summary = require("./utils/getGpt4Summary");
const writeFile = require("./utils/writeFile");
const { parseCommandLineArgs } = require("./utils/params");

const main = async () => {
  console.clear();
  try {
    const timeRangeType = parseCommandLineArgs();

    console.log(chalk.blue(`✓ Using time range: ${timeRangeType}`));

    try {
      const issueText = await getMergedIssues(timeRangeType);

      if (!issueText) return;

      const summary = await getGpt4Summary(issueText);

      writeFile(timeRangeType, summary);
    } catch (error) {
      console.error(chalk.red("Error while fetching issues:"), error.message);
    }
  } catch (error) {
    console.error(
      chalk.red("Error while parsing command line arguments:"),
      error
    );
  }
};

main();
