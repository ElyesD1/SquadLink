#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// List of test modules to run individually
const testModules = [
  { name: 'AuthController', grep: 'AuthController' },
  { name: 'AuthService', grep: 'AuthService' },
  { name: 'UsersController', grep: 'UsersController' },
  { name: 'UsersService', grep: 'UsersService' },
  { name: 'PartyService', grep: 'PartyService' },
  { name: 'EmailService', grep: 'EmailService' },
  { name: 'DiscordService', grep: 'DiscordService' },
  { name: 'RiotApiService', grep: 'RiotApiService' },
  { name: 'RiotEsportsService', grep: 'RiotEsportsService' }
];

async function runTestModule(module) {
  return new Promise((resolve) => {
    console.log(`\n=== ${module.name.toUpperCase()} TESTS ===`);

    const mocha = spawn('npx', ['mocha', '--grep', module.grep, '--reporter', 'json'], {
      cwd: process.cwd(),
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

        // Count passing/failing tests
        let passing = 0;
        let failing = 0;
        let totalDuration = 0;

        results.tests.forEach(test => {
          totalDuration += test.duration || 0;
          if (test.err && Object.keys(test.err).length === 0) {
            passing++;
          } else {
            failing++;
          }
        });

        const avgDuration = results.tests.length > 0 ? (totalDuration / results.tests.length).toFixed(1) : '0.0';

        console.log(`✅ ${passing} passing, ❌ ${failing} failing`);
        console.log(`⏱️  Total: ${totalDuration}ms | Average: ${avgDuration}ms per test`);
        console.log(`📊 Tests: ${results.tests.length}`);

        resolve({
          module: module.name,
          passing,
          failing,
          totalDuration,
          avgDuration: parseFloat(avgDuration),
          testCount: results.tests.length
        });

      } catch (error) {
        console.log(`❌ Error parsing results for ${module.name}: ${error.message}`);
        resolve({
          module: module.name,
          passing: 0,
          failing: 0,
          totalDuration: 0,
          avgDuration: 0,
          testCount: 0
        });
      }
    });
  });
}

async function runAllTests() {
  console.log('🚀 Running Individual Module Tests with Timing\n');

  const results = [];

  for (const module of testModules) {
    const result = await runTestModule(module);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MODULE TEST SUMMARY');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.failing === 0 ? '✅' : '❌';
    console.log(`${result.module.padEnd(25)} | ${result.totalDuration.toString().padStart(4)}ms total | ${result.avgDuration.toFixed(1).padStart(4)}ms avg | ${result.testCount.toString().padStart(2)} tests | ${status}`);
  });

  const totalTests = results.reduce((sum, r) => sum + r.testCount, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.totalDuration, 0);
  const totalPassing = results.reduce((sum, r) => sum + r.passing, 0);
  const totalFailing = results.reduce((sum, r) => sum + r.failing, 0);

  console.log('='.repeat(60));
  console.log(`📈 OVERALL: ${totalTests} tests, ${totalPassing} passing, ${totalFailing} failing, ${totalDuration}ms total`);
}

runAllTests().catch(console.error);