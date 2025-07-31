module.exports = {
  default: {
    // Feature files location
    paths: ['tests/cucumber/features/**/*.feature'],
    
    // Step definitions location
    require: ['tests/cucumber/step-definitions/**/*.cjs'],
    
    // Format options - progress for console, html for report
    format: [
      'progress',
      'html:reports/cucumber-report.html'
    ],
    
    // Publish results (set to false for local development)
    publish: false,
    
    // Exit on first failure (useful during development)
    failFast: false,
    
    // Parallel execution (set to 1 for now)
    parallel: 1
  }
};