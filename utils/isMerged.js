const chalk = require("chalk");
const fetch = require("node-fetch");

const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN || "";

// GitHub repo URL and production branch to filter merged issues
const OWNER = process.env.OWNER || "";
const REPO = process.env.REPO || "";

// Check if a commit or pull request has been merged into the main branch

async function isMerged(gitHubUrl) {
  const prRegExp = /\/pull\/(\d+)/;
  const commitRegExp = /\/commit\/(\w+)/;
  let sha;

  const prMatch = gitHubUrl.match(prRegExp);

  if (prMatch) {
    const prNumber = prMatch[1];
    const prUrl = `https://api.github.com/repos/${OWNER}/${REPO}/pulls/${prNumber}`;
    try {
      const headers = { Authorization: `token ${GITHUB_API_TOKEN}` };
      const response = await fetch(prUrl, { headers: headers });
      const prJson = await response.json();

      sha = prJson.head ? prJson.head.sha : null;
    } catch (error) {
      console.error(`Error: ${error}`);
      return false;
    }
  } else {
    const commitMatch = gitHubUrl.match(commitRegExp);
    if (commitMatch) {
      sha = commitMatch[1];
    } else {
      console.error("Invalid gitHubUrl");
      return false;
    }
  }

  if (!sha) return false;

  const compareUrl = `https://api.github.com/repos/${OWNER}/${REPO}/compare/${sha}...main`;

  const headers = {
    Authorization: `token ${GITHUB_API_TOKEN}`,
  };

  try {
    const response = await fetch(compareUrl, { headers: headers });
    const compareJson = await response.json();

    if (compareJson.message?.includes("No commit found")) {
      return false;
    }

    // Check if the commit (or PR's latest commit) exists in the main branch
    const status = compareJson.status;

    return (
      status === "identical" || // The commit is at the tip of the main branch
      status === "ahead" || // The commit is included in the main branch and there are new commits in main after it
      status === "diverged" // The commit is included in the main branch, but both the main branch and the compared branch have new commits since the compared commit
    );
  } catch (error) {
    console.error(`Error: ${error}`);
    return false;
  }
}

module.exports = isMerged;
