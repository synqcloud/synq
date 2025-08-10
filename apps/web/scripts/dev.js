// NOTE: This script might fail, remove it if you don't need it
import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Enhanced logging with consistent formatting
const log = (color, icon, message, details = "") => {
  const reset = "\x1b[0m";
  const formattedMessage = `${color}${icon} ${message}${reset}`;
  if (details) {
    console.log(`${formattedMessage}\n   ${color}${details}${reset}`);
  } else {
    console.log(formattedMessage);
  }
};

// Visual section headers for better organization
const sectionHeader = (title) => {
  const line = "═".repeat(title.length + 4);
  console.log(`\n\x1b[1;36m╔${line}╗`);
  console.log(`╠ \x1b[1;37m${title}\x1b[1;36m ╣`);
  console.log(`╚${line}╝\x1b[0m`);
};

// Load environment variables with diagnostics
function loadEnv() {
  sectionHeader("ENVIRONMENT SETUP");

  const rootDir = path.resolve(process.cwd(), "..", "..");
  console.log(rootDir);
  const envPath = path.join(rootDir, ".env.local");
  const exampleEnvPath = path.join(rootDir, ".env.example");

  try {
    // Create .env.example if missing
    if (!fs.existsSync(exampleEnvPath)) {
      const template = `# Required Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:54322/postgres`;
      fs.writeFileSync(exampleEnvPath, template);
      log("\x1b[33m", "📝", "Created .env.example template");
    }

    // Create .env.local if missing
    if (!fs.existsSync(envPath)) {
      fs.copyFileSync(exampleEnvPath, envPath);
      log("\x1b[32m", "✔", "Created .env.local from template");
      log("\x1b[33m", "⚠", "Please configure the required variables");
      process.exit(1);
    }

    // Load and verify environment variables
    const envConfig = dotenv.config({ path: envPath });
    if (envConfig.error) throw envConfig.error;

    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      log(
        "\x1b[31m",
        "✖",
        "Missing required variables:",
        missingVars.join(", "),
      );
      log("\x1b[33m", "💡", `Check ${envPath} for these values`);
      process.exit(1);
    }

    log("\x1b[32m", "✔", "Environment variables loaded successfully");

    // Show actual values being used (masking sensitive info)
    console.log("\n\x1b[1;34m=== ACTIVE CONFIGURATION ===\x1b[0m");
    console.log(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(
      `ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(-3)}`,
    );
  } catch (error) {
    log("\x1b[31m", "‼", "Environment setup failed:", error.message);
    process.exit(1);
  }
}

function checkDocker() {
  sectionHeader("DOCKER CHECK");

  try {
    execSync("docker info", { stdio: "ignore" });
    log("\x1b[32m", "✔", "Docker is running and accessible");
  } catch (error) {
    log("\x1b[31m", "✖", "Docker is not running or accessible");
    log(
      "\x1b[33m",
      "💡",
      "Please ensure Docker Desktop is installed and running",
    );
    log(
      "\x1b[34m",
      "📘",
      "Download Docker: https://docs.docker.com/get-docker/",
    );
    process.exit(1);
  }
}

function displayStartupInfo() {
  sectionHeader("SETUP INSTRUCTIONS");

  console.log("\x1b[1;37m1. Install Supabase CLI:\x1b[0m");
  console.log("   \x1b[36m$ npm install -g supabase\x1b[0m");
  console.log("\n\x1b[1;37m2. Start Local Supabase:\x1b[0m");
  console.log("   \x1b[36m$ cd infra && supabase start\x1b[0m");
  console.log("\n\x1b[1;37m3. Configure Environment:\x1b[0m");
  console.log("   Edit \x1b[36m.env.local\x1b[0m with values from:");
  console.log("   - API URL: \x1b[36mhttp://localhost:54321\x1b[0m");
  console.log(
    "   - anon key: \x1b[36meyJhb...\x1b[0m (from supabase start output)",
  );
  console.log("\n\x1b[1;37m4. First Time Setup:\x1b[0m");
  console.log("   \x1b[36m$ yarn install\x1b[0m");
  console.log("   \x1b[36m$ yarn db:reset\x1b[0m (if applicable)");
}

function displayDevelopmentLinks() {
  sectionHeader("DEVELOPMENT LINKS");

  console.log("\x1b[1;37m➤ Application:\x1b[0m");
  console.log("   \x1b[36mhttp://localhost:3000\x1b[0m");

  console.log("\n\x1b[1;37m➤ Supabase Dashboard:\x1b[0m");
  console.log("   \x1b[36mhttp://localhost:54323\x1b[0m");

  console.log("\n\x1b[1;37m➤ Auth Emails:\x1b[0m");
  console.log("   \x1b[36mhttp://localhost:54324\x1b[0m");

  console.log("\n\x1b[1;37m➤ Database Management:\x1b[0m");
  console.log("   \x1b[36mhttp://localhost:8080\x1b[0m (if using pgAdmin)");
}

async function main() {
  try {
    loadEnv();
    checkDocker();

    displayStartupInfo();
    displayDevelopmentLinks();

    sectionHeader("STARTING DEVELOPMENT SERVER");
    log("\x1b[32m", "🚀", "Launching Next.js with Turbopack...");

    const devProcess = spawn("next", ["dev", "--turbopack"], {
      stdio: "inherit",
      shell: true,
    });

    devProcess.on("exit", (code) => {
      process.exit(code);
    });
  } catch (error) {
    log("\x1b[31m", "‼", "Startup failed:", error.message);
    process.exit(1);
  }
}

main();
