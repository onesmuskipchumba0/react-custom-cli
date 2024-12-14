#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import { execSync } from 'child_process';

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
  console.log(
    chalk.cyan('🚀 Instant Project Template Generator 🚀\n')
  );
}

// Spinner for loading effect
function createSpinner(text) {
  const spinner = {
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    spin(index) {
      process.stdout.write(`\r${this.frames[index % this.frames.length]} ${text}`);
    }
  };
  return spinner;
}

// Main CLI Function
const main = async () => {
  // Clear console and display header
  console.clear();
  displayHeader();

  // Project Type Selection with Emojis and Descriptions
  const { projectType, projectName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: chalk.yellow('Choose a project type:'),
      choices: [
        {
          name: `🚀 React Vite (Tailwind) ${chalk.dim('- Fast modern React setup')}`,
          value: 'React Vite (Tailwind)'
        },
        {
          name: `📱 React Native (Expo) ${chalk.dim('- Cross-platform mobile development')}`,
          value: 'React Native (Expo)'
        },
        {
          name: `🌐 Next.js (Tailwind) ${chalk.dim('- Server-side rendering')}`,
          value: 'Next.js (Tailwind)'
        }
      ],
    },
    {
      type: 'input',
      name: 'projectName',
      message: chalk.green('Enter your project name:'),
      default: 'my-awesome-project',
      validate: (input) => {
        // Validate project name (no special characters, spaces)
        const validNameRegex = /^[a-z0-9-_]+$/i;
        return validNameRegex.test(input) 
          ? true 
          : chalk.red('Project name can only contain letters, numbers, hyphens, and underscores');
      },
    },
  ]);

  // Define template paths with more robust resolution
  const templates = {
    'React Vite (Tailwind)': path.resolve(__dirname, 'templates/vite-tailwind-template'),
    'React Native (Expo)': path.resolve(__dirname, 'templates/react-native-expo-template'),
    'Next.js (Tailwind)': path.resolve(__dirname, 'templates/nextjs-tailwind-template'),
  };

  // Get the selected template path
  const templatePath = templates[projectType];

  // Enhanced error handling with colorful messages
  if (!fs.existsSync(templatePath)) {
    console.error(
      chalk.red('❌ Error: ') + 
      chalk.yellow(`Template for ${projectType} not found!`)
    );
    process.exit(1);
  }

  // Destination folder for the new project
  const destinationPath = path.resolve(process.cwd(), projectName);

  // Loading spinner
  const copySpinner = createSpinner('Copying project template...');
  let spinnerIndex = 0;
  const spinnerInterval = setInterval(() => {
    copySpinner.spin(spinnerIndex++);
  }, 100);

  try {
    // Copy template with enhanced fs-extra
    await fs.copy(templatePath, destinationPath, { 
      overwrite: false,
      errorOnExist: true 
    });

    // Clear spinner
    clearInterval(spinnerInterval);
    process.stdout.write('\r');

    // Success message with decorations
    console.log(chalk.green('✅ Project created successfully!'));
    console.log(chalk.blueBright(`📂 Project: ${projectName}`));
    console.log(chalk.cyan(`🗂️  Location: ${destinationPath}`));

    // Optional: Auto-install dependencies
    const { installDeps } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'installDeps',
        message: chalk.yellow('Would you like to install dependencies now?'),
        default: true
      }
    ]);

    if (installDeps) {
      console.log(chalk.blue('📦 Installing dependencies...'));
      process.chdir(destinationPath);
      execSync('npm install', { stdio: 'inherit' });
      console.log(chalk.green('✅ Dependencies installed successfully!'));
    }

    // Final instructions
    console.log('\n' + chalk.magenta('🎉 Happy Coding! 🎉'));
    console.log(chalk.gray(`To get started:\n  cd ${projectName}\n  npm run dev`));

  } catch (error) {
    // Enhanced error handling
    clearInterval(spinnerInterval);
    console.error(
      chalk.red('❌ Error creating project: ') + 
      chalk.yellow(error.message)
    );
    process.exit(1);
  }
};

// Run the main function
main().catch((error) => {
  console.error(chalk.red('🔥 Unexpected error:'), error);
});

export default main;