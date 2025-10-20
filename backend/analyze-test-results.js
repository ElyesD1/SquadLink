#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function processTestResults() {
  try {
    // Read the complete test results
    const rawData = fs.readFileSync('test-results-complete.json', 'utf8');

    // Find the JSON part (skip any console output before it)
    const jsonStart = rawData.indexOf('{');
    const jsonData = jsonStart >= 0 ? rawData.substring(jsonStart) : rawData;

    const results = JSON.parse(jsonData);

    // Process and analyze the results
    const testResults = {
      summary: {
        total: results.stats.tests,
        passing: results.stats.passes,
        failing: results.stats.failures,
        duration: results.stats.duration,
        averagePerTest: Math.round((results.stats.duration / results.stats.tests) * 100) / 100,
        timestamp: new Date().toISOString(),
        startTime: results.stats.start,
        endTime: results.stats.end
      },
      tests: results.tests.map(test => ({
        title: test.title,
        fullTitle: test.fullTitle,
        file: test.file ? path.basename(test.file) : 'unknown',
        duration: test.duration || 0,
        speed: getTestSpeed(test.duration || 0),
        state: test.state || (test.err && Object.keys(test.err).length > 0 ? 'failed' : 'passed'),
        err: test.err && Object.keys(test.err).length > 0 ? {
          message: test.err.message,
          stack: test.err.stack
        } : null
      })),
      failures: results.failures ? results.failures.map(failure => ({
        title: failure.title,
        fullTitle: failure.fullTitle,
        file: failure.file ? path.basename(failure.file) : 'unknown',
        err: {
          message: failure.err.message,
          stack: failure.err.stack
        }
      })) : [],
      performance: {
        fastest: results.tests
          .filter(test => test.duration > 0)
          .sort((a, b) => (a.duration || 0) - (b.duration || 0))
          .slice(0, 10)
          .map(test => ({
            title: test.title,
            file: path.basename(test.file || 'unknown'),
            duration: test.duration,
            speed: getTestSpeed(test.duration)
          })),
        slowest: results.tests
          .filter(test => test.duration > 0)
          .sort((a, b) => (b.duration || 0) - (a.duration || 0))
          .slice(0, 10)
          .map(test => ({
            title: test.title,
            file: path.basename(test.file || 'unknown'),
            duration: test.duration,
            speed: getTestSpeed(test.duration)
          })),
        byFile: getTestsByFile(results.tests),
        speedDistribution: getSpeedDistribution(results.tests)
      }
    };

    // Save detailed analysis to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-timing-analysis-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);

    fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2));

    // Also save individual test timings
    const individualTimings = results.tests.map(test => ({
      test: test.fullTitle,
      file: path.basename(test.file || 'unknown'),
      duration: test.duration || 0,
      speed: getTestSpeed(test.duration || 0),
      status: test.state || (test.err && Object.keys(test.err).length > 0 ? 'failed' : 'passed')
    }));

    const individualFilename = `individual-test-timings-${timestamp}.json`;
    fs.writeFileSync(path.join(__dirname, individualFilename), JSON.stringify(individualTimings, null, 2));

    console.log('\n📊 Test Runtime Analysis Complete');
    console.log('==================================\n');

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

    console.log(`🐌 Top 5 Slowest Tests:`);
    testResults.performance.slowest.slice(0, 5).forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title} (${test.file}): ${test.duration}ms [${test.speed}]`);
    });

    console.log(`\n💾 Files Created:`);
    console.log(`   Detailed Analysis: ${filename}`);
    console.log(`   Individual Timings: ${individualFilename}`);

    console.log(`\n📋 Files by Performance:`);
    const sortedFiles = Object.entries(testResults.performance.byFile)
      .sort(([,a], [,b]) => b.averageDuration - a.averageDuration);

    sortedFiles.forEach(([file, data]) => {
      console.log(`   ${file}: ${data.averageDuration}ms avg (${data.count} tests)`);
    });

  } catch (error) {
    console.error('Error processing test results:', error.message);
    process.exit(1);
  }
}

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
        tests: [],
        speedBreakdown: { fast: 0, medium: 0, slow: 0, 'very-slow': 0 }
      };
    }

    const speed = getTestSpeed(test.duration || 0);
    files[file].count++;
    files[file].totalDuration += test.duration || 0;
    files[file].speedBreakdown[speed]++;
    files[file].tests.push({
      title: test.title,
      duration: test.duration || 0,
      speed: speed
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
    if (speed === 'very-slow') {
      distribution.verySlow++;
    } else {
      distribution[speed]++;
    }
  });

  return distribution;
}

// Run the analysis
processTestResults();