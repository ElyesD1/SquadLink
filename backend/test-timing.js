#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run Mocha tests with timing measurement
const mocha = spawn('npx', ['mocha', '--reporter', 'json'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'inherit']
});

let output = '';
let errorOutput = '';

mocha.stdout.on('data', (data) => {
  output += data.toString();
});

mocha.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

mocha.on('close', (code) => {
  try {
    // Remove any non-JSON output from the beginning
    const jsonStart = output.indexOf('{');
    const jsonOutput = jsonStart >= 0 ? output.substring(jsonStart) : output;

    const results = JSON.parse(jsonOutput);

    // Process and analyze the results
    const testResults = {
      summary: {
        total: results.stats.tests,
        passing: results.stats.passes,
        failing: results.stats.failures,
        duration: results.stats.duration,
        averagePerTest: Math.round((results.stats.duration / results.stats.tests) * 100) / 100,
        timestamp: new Date().toISOString(),
        exitCode: code
      },
      tests: results.tests.map(test => ({
        title: test.title,
        fullTitle: test.fullTitle,
        file: test.file ? path.basename(test.file) : 'unknown',
        duration: test.duration || 0,
        speed: getTestSpeed(test.duration || 0),
        state: test.state,
        err: test.err ? {
          message: test.err.message,
          stack: test.err.stack
        } : null
      })),
      failures: results.failures.map(failure => ({
        title: failure.title,
        fullTitle: failure.fullTitle,
        file: failure.file ? path.basename(failure.file) : 'unknown',
        err: {
          message: failure.err.message,
          stack: failure.err.stack
        }
      })),
      performance: {
        fastest: results.tests
          .filter(test => test.duration > 0)
          .sort((a, b) => (a.duration || 0) - (b.duration || 0))
          .slice(0, 10)
          .map(test => ({
            title: test.title,
            file: path.basename(test.file || 'unknown'),
            duration: test.duration
          })),
        slowest: results.tests
          .filter(test => test.duration > 0)
          .sort((a, b) => (b.duration || 0) - (a.duration || 0))
          .slice(0, 10)
          .map(test => ({
            title: test.title,
            file: path.basename(test.file || 'unknown'),
            duration: test.duration
          })),
        byFile: getTestsByFile(results.tests),
        speedDistribution: getSpeedDistribution(results.tests)
      }
    };

    // Save to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);

    fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2));

    console.log('\n� Test Runtime Analysis');
    console.log('========================\n');

    console.log(`📈 Summary:`);
    console.log(`   Total Tests: ${testResults.summary.total}`);
    console.log(`   Passing: ${testResults.summary.passing}`);
    console.log(`   Failing: ${testResults.summary.failing}`);
    console.log(`   Total Duration: ${testResults.summary.duration}ms`);
    console.log(`   Average per Test: ${testResults.summary.averagePerTest}ms\n`);

    console.log(`📁 Tests by Speed:`);
    console.log(`   Fast (< 10ms): ${testResults.performance.speedDistribution.fast}`);
    console.log(`   Medium (10-50ms): ${testResults.performance.speedDistribution.medium}`);
    console.log(`   Slow (50-100ms): ${testResults.performance.speedDistribution.slow}`);
    console.log(`   Very Slow (> 100ms): ${testResults.performance.speedDistribution.verySlow}\n`);

    console.log(`🐌 Slowest Tests:`);
    testResults.performance.slowest.slice(0, 5).forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title} (${test.file}): ${test.duration}ms`);
    });

    console.log(`\n💾 Results saved to: ${filename}`);

  } catch (error) {
    console.error('Error parsing test results:', error.message);
    console.error('Raw output:', output.substring(0, 500) + '...');
    if (errorOutput) {
      console.error('Error output:', errorOutput);
    }
    process.exit(1);
  }

  process.exit(code);
});

function getTestSpeed(duration) {
  if (duration < 10) return 'fast';
  if (duration < 50) return 'medium';
  if (duration < 100) return 'slow';
  return 'very-slow';
}

function getTestsByFile(tests) {
  const files = {};

  tests.forEach(test => {
    const file = test.file ? path.basename(test.file) : 'unknown';
    if (!files[file]) {
      files[file] = {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        tests: []
      };
    }

    files[file].count++;
    files[file].totalDuration += test.duration || 0;
    files[file].tests.push({
      title: test.title,
      duration: test.duration || 0,
      speed: getTestSpeed(test.duration || 0)
    });
  });

  // Calculate averages
  Object.keys(files).forEach(file => {
    files[file].averageDuration = Math.round((files[file].totalDuration / files[file].count) * 100) / 100;
  });

  return files;
}

function getSpeedDistribution(tests) {
  const distribution = {
    fast: 0,
    medium: 0,
    slow: 0,
    verySlow: 0
  };

  tests.forEach(test => {
    const speed = getTestSpeed(test.duration || 0);
    distribution[speed]++;
  });

  return distribution;
}