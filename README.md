# Release Notes Generator

This is a Node.js script that **generates release notes** for your completed Linear issues in the past week. 

It utilizes the Linear API and the OpenAI GPT language model to create a nicely formatted Markdown file with sections for New Features, Improvements, and Fixes.

## Setup

Install the required dependencies using yarn:

```bash
yarn install
```

Copy the .env.template file to a new file named .env and fill in the required environment variables:

```
cp .env.template .env
```

Open the .env file in your favorite text editor and replace the placeholder values with your actual Linear and OpenAI API keys:

```
YOUR_LINEAR_PERSONAL_API_KEY=<your-linear-api-key>
YOUR_OPENAI_API_KEY=<your-openai-api-key>
```

## Run the Script

Once you have set up the environment variables, simply run the script using yarn:

```
yarn start [timerange]
```

`timerange` is optional. It can be one of the following values:

* `last-7-days` (default)
* `current-week`
* `previous-week`

The script will generate the release notes, save them in a Markdown file named `release-notes-YYYY-MM-DD.md` (replacing YYYY-MM-DD with the current date), and display the contents in the console.
