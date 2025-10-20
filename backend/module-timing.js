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
mocha.stdout.on('data', (data) => {
  output += data.toString();
});

mocha.on('close', (code) => {
  try {
    // Remove any non-JSON output from the beginning
    const jsonStart = output.indexOf('{');
    const jsonOutput = jsonStart >= 0 ? output.substring(jsonStart) : output;

    const results = JSON.parse(jsonOutput);

    // Group tests by module and calculate durations
    const modules = {};

    results.tests.forEach(test => {
      const file = test.file ? path.basename(test.file).replace('.spec.ts', '') : 'unknown';
      if (!modules[file]) {
        modules[file] = {
          tests: 0,
          totalDuration: 0,
          passing: 0,
          failing: 0
        };
      }

      modules[file].tests++;
      modules[file].totalDuration += test.duration || 0;

      if (test.err && Object.keys(test.err).length === 0) {
        modules[file].passing++;
      } else {
        modules[file].failing++;
      }
    });

    console.log('\n📊 Module Test Durations\n');
    console.log('=' .repeat(50));

    // Sort by total duration (descending)
    const sortedModules = Object.entries(modules)
      .sort(([,a], [,b]) => b.totalDuration - a.totalDuration);

    sortedModules.forEach(([module, data]) => {
      const avgDuration = (data.totalDuration / data.tests).toFixed(1);
      const status = data.failing > 0 ? `❌ ${data.failing} failed` : '✅ all passing';

      console.log(`${module.padEnd(25)} | ${data.totalDuration.toString().padStart(4)}ms total | ${avgDuration.padStart(4)}ms avg | ${data.tests.toString().padStart(2)} tests | ${status}`);
    });

    console.log('='.repeat(50));
    console.log(`\n📈 Overall: ${results.stats.tests} tests, ${results.stats.passes} passing, ${results.stats.failures} failing, ${results.stats.duration}ms total`);

  } catch (error) {
    console.error('Error processing test results:', error.message);
  }

  process.exit(code);
});