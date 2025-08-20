const { exec } = require('child_process');
const path = require('path');

// This script is for development purposes only.
// It uses PowerShell to re-launch the main Electron process with admin rights.
// This is necessary because many of the app's functions (tweaking, debloating)
// require elevated permissions to modify the system.

// Guard against recursive execution.
if (process.env.IS_ELEVATED) {
  console.log('Process is already elevated. Exiting launcher.');
  process.exit(0);
}

console.log('Requesting administrator privileges for development server...');

const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
const appPath = '.'; // Argument for Electron: run the app in the current directory.
const workDir = __dirname; // The directory where the command should run.

// Use PowerShell to start a new process with the "Run as Administrator" verb and set the correct working directory.
const command = `powershell.exe -Command "Start-Process -FilePath '${electronPath}' -ArgumentList '${appPath}' -WorkingDirectory '${workDir}' -Verb RunAs"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    // This error likely occurs if the user clicks "No" on the UAC prompt.
    console.error(`Elevation failed. This can happen if you decline the UAC prompt. Error: ${error.message}`);
    process.exit(1); // Exit with an error code.
    return;
  }
  if (stderr) {
    console.error(`PowerShell stderr: ${stderr}`);
  }
  
  // The original, non-elevated process can now exit as the elevated one has taken over.
  process.exit(0);
});
