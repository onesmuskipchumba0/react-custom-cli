#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import { execSync } from 'child_process';
import ora from 'ora';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ASCII Art Header Function
function displayHeader() {
  console.log(
    chalk.hex('#87CEEB')(
      figlet.textSync('Create Custom', {
        font: 'Big',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
      })
    )
  );
  console.log(chalk.cyan('🚀 Instant Project Template Generator 🚀\n'));
  console.log(chalk.gray('Created by Onesmus Bett'));
  console.log(chalk.gray('GitHub: onesmuskipchumba0'));
  console.log(chalk.gray('Email: onesmuskipchumba5@gmail.com\n'));
}

// Main CLI Function
const main = async () => {
  // Clear console and display header
  console.clear();
  displayHeader();

  // Add an exit option to the project type selection
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: chalk.yellow('Choose a project type or exit:'),
      choices: [
        {
          name: `🚀 React Vite (Tailwind) ${chalk.dim('- Fast modern React setup with Javascript')}`,
          value: 'React Vite (Tailwind)'
        },
        {
          name: `🤖 React Vite (Tailwind & Typescript) ${chalk.dim('- Fast modern React setup with Typescript')}`,
          value: 'React Vite (Tailwind & Typescript)'
        },
        {
          name: `📱 React Native (Expo) ${chalk.dim('- Cross-platform mobile development')}`,
          value: 'React Native (Expo)'
        },
        {
          name: `🌐 Next.js (Tailwind) Javascript ${chalk.dim('- Server-side rendering')}`,
          value: 'Next.js (Tailwind) Javascript'
        },
        {
          name: `🌐 Next.js (Tailwind) Typescript ${chalk.dim('- Server-side rendering')}`,
          value: 'Next.js (Tailwind) Typescript'
        },
        new inquirer.Separator(),
        {
          name: `🚪 Exit ${chalk.dim('- Close the application')}`,
          value: 'exit'
        }
      ],
    }
  ]);

  // Exit option handling
  if (projectType === 'exit') {
    console.log(chalk.yellow('👋 Exiting project generator. Goodbye!'));
    process.exit(0);
  }

  // Project Name Input
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: chalk.green('Enter your project name:'),
      default: 'my-awesome-project',
      validate: (input) => {
        const validNameRegex = /^[a-z0-9-_]+$/i;
        return validNameRegex.test(input)
          ? true
          : chalk.red('Project name can only contain letters, numbers, hyphens, and underscores');
      },
    }
  ]);

  // Define template paths
  const templates = {
    'React Vite (Tailwind)': path.resolve(__dirname, 'templates/vite-tailwind-template'),
    'React Vite (Tailwind & Typescript)': path.resolve(__dirname, 'templates/vite-tailwind-template-ts'),
    'React Native (Expo)': path.resolve(__dirname, 'templates/react-native-expo-template'),
    'Next.js (Tailwind) Javascript': path.resolve(__dirname, 'templates/nextjs-tailwind-template'),
    'Next.js (Tailwind) Typescript': path.resolve(__dirname, 'templates/nextjs-js-template-ts'),
  };

  // Get the selected template path
  const templatePath = templates[projectType];

  // Error handling for missing template
  if (!fs.existsSync(templatePath)) {
    console.error(
      chalk.red('❌ Error: ') +
      chalk.yellow(`Template for ${projectType} not found!`)
    );
    process.exit(1);
  }

  // Destination folder for the new project
  const destinationPath = path.resolve(process.cwd(), projectName);

  // Handle folder existence
  if (fs.existsSync(destinationPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: chalk.red(`The folder "${projectName}" already exists. Overwrite it?`),
        default: false
      }
    ]);
    if (!overwrite) {
      console.log(chalk.yellow('⚠️ Operation cancelled.'));
      process.exit(0);
    } else {
      await fs.remove(destinationPath); // Clear the existing folder
    }
  }

  // Copy template with spinner
  const spinner = ora('Copying project template...').start();
  try {
    await fs.copy(templatePath, destinationPath);
    spinner.succeed('Project template copied successfully!');
  } catch (error) {
    spinner.fail('Failed to copy project template.');
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }

  // Git initialization
  try {
    process.chdir(destinationPath);
    execSync('git init && git add . && git commit -m "Initial commit"', { stdio: 'inherit' });
    console.log(chalk.green('✅ Git repository initialized!'));
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Git initialization failed. You can do this manually.'));
  }

  // Auto-install dependencies
  const { installDeps } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDeps',
      message: chalk.yellow('Would you like to install dependencies now?'),
      default: true
    }
  ]);

  if (installDeps) {
    try {
      console.log(chalk.blue('📦 Installing dependencies...'));
      execSync('npm install', { stdio: 'inherit' });
      console.log(chalk.green('✅ Dependencies installed successfully!'));
    } catch (error) {
      console.warn(chalk.red('❌ Dependency installation failed:'), error.message);
    }
  }

  // Add option to open in code editor
  const { openEditor } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openEditor',
      message: chalk.yellow('Would you like to open the project in your default code editor?'),
      default: true
    }
  ]);

  if (openEditor) {
    try {
      execSync(`code ${destinationPath}`, { stdio: 'inherit' });
      console.log(chalk.green('✅ Project opened in the code editor!'));
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Could not open the project in the editor. Make sure VS Code is installed.'));
    }
  }

  // Final instructions
  console.log('\n' + chalk.magenta('🎉 Project setup complete! 🎉'));
  console.log(chalk.gray(`To get started:\n  cd ${projectName}\n  npm run dev`));
};

// Run the main function
main().catch((error) => {
  console.error(chalk.red('🔥 Unexpected error:'), error.stack);
});
