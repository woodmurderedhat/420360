// test-runner.js
// Loads the test framework and all test files, then runs tests in the browser
import './test-framework.js';

// Import test files here (add more as you create them)
import './EventBus.test.js';
import './Resources.test.js';
import './Tree.test.js';
import './UI.test.js';
import './Achievements.test.js';
import './Events.test.js';
import './SaveLoad.test.js';
import './manifestValidator.test.js';
import './PluginManager.test.js';
import './DataLoader.test.js';

// Run tests and optionally display results in the HTML page
document.addEventListener('DOMContentLoaded', async () => {
  if (window.runTests) {
    await window.runTests();
    // Optionally, display a message in the page
    const div = document.getElementById('test-results');
    if (div) div.textContent = 'See console for test results.';
  }
});
