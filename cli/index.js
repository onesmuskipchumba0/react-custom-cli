#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import { execSync } from 'child_process';

// Prompt the user for the project type and name
const main = async () => {
  const { projectType, projectName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'Choose a project type:',
      choices: ['React Vite (Tailwind)', 'React Native (Expo)', 'Next.js (Tailwind)'],
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter your project name:',
      default: 'my-project',
      validate: (input) => input.trim() ? true : 'Project name cannot be empty',
    },
  ]);

  // Define template paths
  const templates = {
    'React Vite (Tailwind)': './templates/vite-tailwind-template',
    'React Native (Expo)': './templates/react-native-expo-template',
    'Next.js (Tailwind)': './templates/nextjs-tailwind-template',
  };

  // Get the selected template path
  const templatePath = templates[projectType];

  if (!fs.existsSync(templatePath)) {
    console.error('Template not found!');
    process.exit(1);
  }

  // Destination folder for the new project
  const destinationPath = `./${projectName}`;

  // Copy the template to the new folder
  fs.cpSync(templatePath, destinationPath, { recursive: true });

  console.log(`Project ${projectName} created successfully!`);
  console.log(`Navigate to ${projectName} and start coding.`);
};

main().catch((error) => {
  console.error('An error occurred:', error);
});
