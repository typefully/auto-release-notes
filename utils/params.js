const chalk = require("chalk");

/* ----------------------------- Display help ----------------------------- */

function displayHelpMessage(params) {
  // Display the help message with all supported parameters
  console.log(chalk.bold(chalk.yellow("Usage:")));
  console.log("  yarn start <parameters>\n");

  console.log(chalk.bold(chalk.yellow("Supported Parameters:")));
  for (const [key, value] of Object.entries(params)) {
    console.log(`  ${key.padEnd(15)}${value}`);
  }
}

/* ------------------------- Supported parameters ------------------------- */

const supportedParams = {
  "last-7-days": "Generate release notes for the last 7 days (default).",
  "curr-week": "Generate release notes for the current week.",
  "prev-week": "Generate release notes for the previous week.",
  "curr-month": "Generate release notes for the current month.",
  "prev-month": "Generate release notes for the previous month.",
  "--help": "Display this help message.",
};

/* ----------------------------- Parse arguments ---------------------------- */

function parseCommandLineArgs() {
  const args = process.argv.slice(2);

  const type = args[0] || "last-7-days"; // Use the default value if no arguments are provided.

  switch (type) {
    case "last-7-days":
    case "curr-week":
    case "prev-week":
    case "curr-month":
    case "prev-month":
      return type;
    case "--help":
      displayHelpMessage(supportedParams);
      process.exit(0);
    default:
      throw new Error("Invalid parameter. Pass '--help' for more information.");
  }
}

module.exports = {
  parseCommandLineArgs,
};
