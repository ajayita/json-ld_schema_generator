/**
 * Simple testing framework for Schema Snap
 * Lightweight framework for running unit tests
 */

class TestFramework {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    /**
     * Add a test
     */
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Run all tests
     */
    async runAll() {
        console.log('🧪 Running Schema Snap Tests...\n');
        
        for (const test of this.tests) {
            try {
                await this.runTest(test);
            } catch (error) {
                this.results.failed++;
                this.results.errors.push({
                    test: test.name,
                    error: error.message
                });
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }

        this.printSummary();
        return this.results;
    }

    /**
     * Run a single test
     */
    async runTest(test) {
        const assertions = new TestAssertions();
        
        try {
            await test.testFunction(assertions);
            this.results.passed++;
            console.log(`✅ ${test.name}`);
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({
                test: test.name,
                error: error.message
            });
            console.error(`❌ ${test.name}: ${error.message}`);
        }
    }

    /**
     * Print test summary
     */
    printSummary() {
        const total = this.results.passed + this.results.failed;
        console.log('\n📊 Test Summary:');
        console.log(`Total: ${total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        
        if (this.results.failed > 0) {
            console.log('\n💥 Failures:');
            this.results.errors.forEach(error => {
                console.log(`  • ${error.test}: ${error.error}`);
            });
        }
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed!');
        }
    }
}

/**
 * Test assertions
 */
class TestAssertions {
    /**
     * Assert that two values are equal
     */
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            const msg = message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that value is truthy
     */
    assertTrue(value, message = '') {
        if (!value) {
            const msg = message || `Expected truthy value, got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that value is falsy
     */
    assertFalse(value, message = '') {
        if (value) {
            const msg = message || `Expected falsy value, got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that value is null or undefined
     */
    assertNull(value, message = '') {
        if (value !== null && value !== undefined) {
            const msg = message || `Expected null/undefined, got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that value is not null or undefined
     */
    assertNotNull(value, message = '') {
        if (value === null || value === undefined) {
            const msg = message || `Expected non-null value, got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that array contains value
     */
    assertContains(array, value, message = '') {
        if (!Array.isArray(array) || !array.includes(value)) {
            const msg = message || `Expected array to contain ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that object has property
     */
    assertHasProperty(object, property, message = '') {
        if (!object || !object.hasOwnProperty(property)) {
            const msg = message || `Expected object to have property '${property}'`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that function throws error
     */
    assertThrows(func, message = '') {
        try {
            func();
            const msg = message || 'Expected function to throw error';
            throw new Error(msg);
        } catch (error) {
            // Expected behavior
        }
    }

    /**
     * Assert that value matches regex
     */
    assertMatches(value, regex, message = '') {
        if (!regex.test(value)) {
            const msg = message || `Expected '${value}' to match ${regex}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that arrays are equal
     */
    assertArrayEqual(actual, expected, message = '') {
        if (!Array.isArray(actual) || !Array.isArray(expected)) {
            const msg = message || 'Both values must be arrays';
            throw new Error(msg);
        }
        
        if (actual.length !== expected.length) {
            const msg = message || `Arrays have different lengths: ${actual.length} vs ${expected.length}`;
            throw new Error(msg);
        }
        
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                const msg = message || `Arrays differ at index ${i}: ${actual[i]} vs ${expected[i]}`;
                throw new Error(msg);
            }
        }
    }

    /**
     * Assert deep equality for objects
     */
    assertDeepEqual(actual, expected, message = '') {
        const actualJson = JSON.stringify(actual, null, 2);
        const expectedJson = JSON.stringify(expected, null, 2);
        
        if (actualJson !== expectedJson) {
            const msg = message || `Objects are not deep equal:\nActual: ${actualJson}\nExpected: ${expectedJson}`;
            throw new Error(msg);
        }
    }
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestFramework, TestAssertions };
} else {
    window.TestFramework = TestFramework;
    window.TestAssertions = TestAssertions;
}