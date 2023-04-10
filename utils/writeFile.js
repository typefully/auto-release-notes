const chalk = require("chalk");
const fs = require("fs");
const dayjs = require("dayjs");

function writeFile(timeRangeType, summaryText) {
  const isStartOfWeek = dayjs().day() === 1;

  const fileName = (() => {
    switch (timeRangeType) {
      case "last-7-days":
        return `release-notes-${dayjs()
          .subtract(7, "days")
          .format("YYYY-MM-DD")}>${dayjs().format("YYYY-MM-DD")}.md`;

      case "curr-week":
        const startOfWeek = dayjs().startOf("week");
        return isStartOfWeek
          ? `release-notes-${dayjs().format("YYYY-MM-DD")}.md`
          : `release-notes-${startOfWeek.format("YYYY-MM-DD")}>${dayjs().format(
              "YYYY-MM-DD"
            )}.md`;

      case "prev-week":
        const startOfPrevWeek = dayjs().startOf("week").subtract(1, "weeks");
        return `release-notes-${startOfPrevWeek.format(
          "YYYY-MM-DD"
        )}>${startOfPrevWeek.add(6, "day").format("YYYY-MM-DD")}.md`;

      case "curr-month":
        const currMonth = dayjs().format("YYYY-MM");
        return `release-notes-${currMonth}.md`;

      case "prev-month":
        const prevMonth = dayjs().subtract(1, "months").format("YYYY-MM");
        return `release-notes-${prevMonth}.md`;

      default:
        throw new Error("Invalid time range type");
    }
  })();

  fs.writeFileSync(fileName, summaryText);
  console.log(chalk.bold(chalk.green(`\n✅ ${fileName} file created/updated`)));
}

module.exports = writeFile;
