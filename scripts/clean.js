const { execSync } = require('child_process');

function killPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`).toString();
    const lines = output.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    });

    pids.forEach(pid => {
      console.log(`Killing process ${pid} on port ${port}...`);
      try {
        execSync(`taskkill /F /PID ${pid} /T`);
      } catch (e) {
        // Ignore if already dead
      }
    });
  } catch (e) {
    // Port not in use
  }
}

console.log('Cleaning up ports 3000 and 3001...');
killPort(3000);
killPort(3001);
console.log('Cleanup complete.');
