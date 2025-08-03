# Schema Snap Test Suite

This directory contains the testing framework and test suites for Schema Snap utilities.

## Test Structure

```
tests/
├── test-framework.js       # Lightweight testing framework
├── validators.test.js      # Tests for form validation utilities
├── jsonld-generator.test.js # Tests for JSON-LD generation
├── geocoder.test.js        # Tests for geocoding utilities
├── run-tests.js           # Main test runner
├── test-runner.html       # Browser-based test interface
└── README.md              # This file
```

## Running Tests

### Browser Testing (Recommended)
1. Open a terminal in the project root
2. Start the test server: `npm run test:browser`
3. Open your browser to `http://localhost:8001/test-runner.html`
4. Click "Run All Tests" to execute the complete test suite

### Command Line Testing
```bash
# Run all tests
npm test

# Or run directly with Node.js
node tests/run-tests.js
```

### Development Server
```bash
# Start the main application
npm start
# Then visit http://localhost:8000
```

## Test Coverage

### Validators (`validators.test.js`)
- ✅ Required field validation
- ✅ Email format validation  
- ✅ URL format validation and normalization
- ✅ Phone number validation and formatting
- ✅ Coordinate validation (latitude/longitude)
- ✅ Postal code validation (US, CA, UK, AU)
- ✅ Text length validation
- ✅ Time format validation
- ✅ Time range validation
- ✅ Text sanitization
- ✅ Input normalization

### JSON-LD Generator (`jsonld-generator.test.js`)
- ✅ Basic schema generation
- ✅ Complete schema with all fields
- ✅ Address object building
- ✅ Geo coordinates handling
- ✅ Opening hours specifications
- ✅ 24/7 business hours
- ✅ Text sanitization
- ✅ Schema validation
- ✅ JSON formatting and minification
- ✅ HTML script tag generation
- ✅ Completeness scoring
- ✅ Example data generation

### Geocoder (`geocoder.test.js`)
- ✅ Coordinate validation
- ✅ Distance calculations
- ✅ Address string building
- ✅ Rate limiting
- ✅ Cache operations
- ✅ Nominatim address parsing
- ✅ Accuracy estimation
- ✅ Coordinate conversion utilities

## Test Framework Features

### Simple Assertions
```javascript
assert.assertEqual(actual, expected);
assert.assertTrue(value);
assert.assertFalse(value);
assert.assertNull(value);
assert.assertNotNull(value);
assert.assertContains(array, value);
assert.assertHasProperty(object, property);
assert.assertThrows(function);
assert.assertMatches(value, regex);
assert.assertArrayEqual(actual, expected);
assert.assertDeepEqual(actual, expected);
```

### Adding New Tests
```javascript
import { TestFramework } from './test-framework.js';

export function runMyTests(test) {
    test('Test name', (assert) => {
        // Your test code here
        assert.assertEqual(actual, expected);
    });
    
    test('Another test', (assert) => {
        // More test code
        assert.assertTrue(condition);
    });
}
```

### Test Output
- ✅ **Passed tests**: Green checkmarks with test names
- ❌ **Failed tests**: Red X with error details  
- 📊 **Summary**: Total, passed, failed counts and duration
- 🧪 **Console output**: Real-time test execution logs

## Browser Test Interface

The `test-runner.html` provides a user-friendly web interface with:

- **Run All Tests**: Execute the complete test suite
- **Clear Output**: Reset the test output display
- **Real-time Results**: Live console output capture
- **Summary Dashboard**: Visual test statistics
- **Error Details**: Detailed failure information

## Performance Benchmarks

The test suite measures:
- **Test execution time**: Individual and total duration
- **Memory usage**: Via browser dev tools
- **Validation speed**: Form validation performance
- **JSON generation**: Schema creation speed

## Best Practices

1. **Run tests before commits**: Ensure all tests pass
2. **Add tests for new features**: Maintain test coverage
3. **Use descriptive test names**: Make failures easy to understand
4. **Test edge cases**: Boundary conditions and error states
5. **Keep tests focused**: One assertion per test when possible

## Troubleshooting

### Tests Not Loading
- Ensure you're running the test server (`npm run test:browser`)
- Check browser console for module loading errors
- Verify all test files are present and properly formatted

### Import Errors
- Confirm all import paths are correct and use `.js` extensions
- Check that modules export the expected functions
- Ensure you're using a modern browser with ES6 module support

### Test Failures
- Review the detailed error messages in the console output
- Check that test data matches expected formats
- Verify that utility functions haven't changed their APIs

## Future Enhancements

Planned improvements to the test suite:

- [ ] Code coverage reporting
- [ ] Performance regression testing
- [ ] Integration tests for components
- [ ] Automated testing in CI/CD
- [ ] Visual regression testing
- [ ] Accessibility testing automation