// Import the dotenv package to load environment variables from .env files
const dotenv = require('dotenv');
// Import the path package to handle file path operations
const path = require('path');

// Load environment variables from the .env.test.local file located in the current working directory
dotenv.config({ path: path.resolve(process.cwd(), ".env.test.local") });