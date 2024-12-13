#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');

// Resolve paths dynamically
const templatesDir = path.resolve(__dirname, 'templates');

async function main() {
  console.log(chalk.green('Welcome to Create-Custom CLI! 🚀'));

  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Select a project template:',
      choices: [
        'React (Vite)',
        'React Native (Expo)',
        'Next.js',
        'Custom Template (pre-downloaded)',
      ],
    },
  ]);

  switch (framework) {
    case 'React (Vite)':
      console.log(chalk.blue('Creating React (Vite) project...'));
      execSync('npm create vite@latest', { stdio: 'inherit' });
      break;

    case 'React Native (Expo)':
      console.log(chalk.blue('Creating React Native (Expo) project...'));
      execSync('npx create-expo-app my-app', { stdio: 'inherit' });
      break;

    case 'Next.js':
      console.log(chalk.blue('Creating Next.js project...'));
      execSync('npx create-next-app@latest', { stdio: 'inherit' });
      break;

    case 'Custom Template (pre-downloaded)':
      const templates = fs.readdirSync(templatesDir);
      if (!templates.length) {
        console.log(chalk.red('No templates found in the "templates" folder.'));
        return;
      }

      const { template } = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Choose a template:',
          choices: templates,
        },
      ]);

      const sourcePath = path.join(templatesDir, template);
      const destPath = path.join(process.cwd(), template);

      console.log(chalk.blue(`Copying template "${template}" to current directory...`));
      fs.cpSync(sourcePath, destPath, { recursive: true });
      console.log(chalk.green('Template copied successfully!'));
      break;

    default:
      console.log(chalk.red('Invalid option selected.'));
      break;
  }
}

main().catch((err) => {
  console.error(chalk.red('Error:', err.message));
  process.exit(1);
});
