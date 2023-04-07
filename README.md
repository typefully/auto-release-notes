# Release Notes Generator

At [Typefully](https://typefully.com), we're often busy developing and don't spend much time communicating the work we do. That's why I created this Node.js script to **automatically generate release notes** for our completed Linear issues from the past week. 

It uses the Linear API and the OpenAI GPT language model to create a nicely formatted Markdown file with sections for New Features, Improvements, and Fixes.

You can plug your Linear and OpenAI API keys into the script and run it to generate release notes for you.

![Release Notes Generator](./assets/preview.gif)

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

You need [GPT-4 access](https://openai.com/waitlist/gpt-4-api) to make best use of this script, since it doesn't seems to work well with any other model.

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

## Customize the Script

The script is quite opinionated as it is. For example I'm excluding issues with projects, since closed project issues aren't usually live yet.

I recommend customizing the `getCompletedIssues` function to suit your needs, for example filtering issues by project or label.