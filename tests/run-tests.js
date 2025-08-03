/**
 * Test runner for Schema Snap
 * Run this file to execute all tests
 */

import { TestFramework } from './test-framework.js';
import { runValidatorTests } from './validators.test.js';
import { runJsonLdGeneratorTests } from './jsonld-generator.test.js';
import { runGeocoderTests } from './geocoder.test.js';

async function runAllTests() {
    const framework = new TestFramework();
    
    console.log('🚀 Starting Schema Snap Test Suite\n');
    
    // Register all test suites
    console.log('📝 Registering Validator Tests...');
    runValidatorTests(framework.test.bind(framework));
    
    console.log('📄 Registering JSON-LD Generator Tests...');
    runJsonLdGeneratorTests(framework.test.bind(framework));
    
    console.log('🌍 Registering Geocoder Tests...');
    runGeocoderTests(framework.test.bind(framework));
    
    console.log(`\n📊 Total tests registered: ${framework.tests.length}\n`);
    
    // Run all tests
    const results = await framework.runAll();
    
    // Return results for programmatic use
    return results;
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Running tests in browser...');
        runAllTests().then(results => {
            console.log('Tests completed!', results);
        });
    });
} else if (typeof module !== 'undefined' && require.main === module) {
    // Node.js environment
    runAllTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}

export { runAllTests };