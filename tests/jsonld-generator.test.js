/**
 * Tests for JSON-LD generator utility
 */

import { JsonLdGenerator } from '../src/utils/jsonld-generator.js';

export function runJsonLdGeneratorTests(test) {
    // Basic schema generation
    test('Generate basic schema with minimal data', (assert) => {
        const formData = {
            businessName: 'Test Business',
            streetAddress: '123 Main St',
            city: 'Test City',
            state: 'CA',
            postalCode: '12345',
            country: 'US',
            phone: '(555) 123-4567',
            businessType: 'LocalBusiness'
        };

        const result = JsonLdGenerator.generate(formData);
        
        assert.assertEqual(result['@context'], 'https://schema.org');
        assert.assertEqual(result['@type'], 'LocalBusiness');
        assert.assertEqual(result.name, 'Test Business');
        assert.assertEqual(result.telephone, '(555) 123-4567');
        assert.assertHasProperty(result, 'address');
        assert.assertEqual(result.address['@type'], 'PostalAddress');
    });

    test('Generate schema with all optional fields', (assert) => {
        const formData = {
            businessName: 'Complete Business',
            businessType: 'Restaurant',
            description: 'A great restaurant',
            phone: '(555) 123-4567',
            website: 'https://example.com',
            email: 'info@example.com',
            streetAddress: '123 Main St',
            city: 'Test City',
            state: 'CA',
            postalCode: '12345',
            country: 'US',
            latitude: '37.7749',
            longitude: '-122.4194',
            priceRange: '$$'
        };

        const result = JsonLdGenerator.generate(formData);
        
        assert.assertEqual(result['@type'], 'Restaurant');
        assert.assertEqual(result.description, 'A great restaurant');
        assert.assertEqual(result.url, 'https://example.com');
        assert.assertEqual(result.email, 'info@example.com');
        assert.assertEqual(result.priceRange, '$$');
        assert.assertHasProperty(result, 'geo');
        assert.assertEqual(result.geo['@type'], 'GeoCoordinates');
        assert.assertEqual(result.geo.latitude, 37.7749);
        assert.assertEqual(result.geo.longitude, -122.4194);
    });

    test('Generate empty schema for no data', (assert) => {
        const result = JsonLdGenerator.generate({});
        
        assert.assertEqual(result['@context'], 'https://schema.org');
        assert.assertEqual(result['@type'], 'LocalBusiness');
        assert.assertEqual(result.name, 'Your Business Name');
        assert.assertHasProperty(result, 'address');
        assert.assertEqual(result.telephone, '(555) 123-4567');
    });

    // Address building
    test('Build complete address object', (assert) => {
        const formData = {
            streetAddress: '123 Main Street',
            city: 'San Francisco',
            state: 'California',
            postalCode: '94102',
            country: 'US'
        };

        const result = JsonLdGenerator.buildAddress(formData);
        
        assert.assertEqual(result['@type'], 'PostalAddress');
        assert.assertEqual(result.streetAddress, '123 Main Street');
        assert.assertEqual(result.addressLocality, 'San Francisco');
        assert.assertEqual(result.addressRegion, 'California');
        assert.assertEqual(result.postalCode, '94102');
        assert.assertEqual(result.addressCountry, 'US');
    });

    test('Build partial address object', (assert) => {
        const formData = {
            city: 'San Francisco',
            state: 'CA'
        };

        const result = JsonLdGenerator.buildAddress(formData);
        
        assert.assertEqual(result['@type'], 'PostalAddress');
        assert.assertEqual(result.addressLocality, 'San Francisco');
        assert.assertEqual(result.addressRegion, 'CA');
        assert.assertFalse(result.hasOwnProperty('streetAddress'));
    });

    // Geo coordinates
    test('Build geo coordinates object', (assert) => {
        const formData = {
            latitude: '37.7749',
            longitude: '-122.4194'
        };

        const result = JsonLdGenerator.buildGeoCoordinates(formData);
        
        assert.assertNotNull(result);
        assert.assertEqual(result['@type'], 'GeoCoordinates');
        assert.assertEqual(result.latitude, 37.7749);
        assert.assertEqual(result.longitude, -122.4194);
    });

    test('Build geo coordinates - missing data', (assert) => {
        const formData = {
            latitude: '37.7749'
            // missing longitude
        };

        const result = JsonLdGenerator.buildGeoCoordinates(formData);
        assert.assertNull(result);
    });

    test('Build geo coordinates - invalid data', (assert) => {
        const formData = {
            latitude: 'not-a-number',
            longitude: '-122.4194'
        };

        const result = JsonLdGenerator.buildGeoCoordinates(formData);
        assert.assertNull(result);
    });

    // Opening hours
    test('Build opening hours - 24/7', (assert) => {
        const formData = {
            open24Hours: true
        };

        const result = JsonLdGenerator.buildOpeningHours(formData);
        
        assert.assertEqual(result.length, 1);
        assert.assertEqual(result[0]['@type'], 'OpeningHoursSpecification');
        assert.assertEqual(result[0].opens, '00:00');
        assert.assertEqual(result[0].closes, '23:59');
        assert.assertContains(result[0].dayOfWeek, 'Monday');
        assert.assertContains(result[0].dayOfWeek, 'Sunday');
    });

    test('Build opening hours - specific days', (assert) => {
        const formData = {
            openingHours: {
                monday: { open: '09:00', close: '17:00' },
                tuesday: { open: '09:00', close: '17:00' },
                wednesday: { open: '09:00', close: '17:00' }
            }
        };

        const result = JsonLdGenerator.buildOpeningHours(formData);
        
        assert.assertTrue(result.length > 0);
        
        // Should group consecutive days with same hours
        const spec = result.find(s => Array.isArray(s.dayOfWeek));
        if (spec) {
            assert.assertContains(spec.dayOfWeek, 'Monday');
            assert.assertEqual(spec.opens, '09:00');
            assert.assertEqual(spec.closes, '17:00');
        }
    });

    test('Build opening hours - different hours per day', (assert) => {
        const formData = {
            openingHours: {
                monday: { open: '09:00', close: '17:00' },
                friday: { open: '09:00', close: '20:00' },
                saturday: { open: '10:00', close: '18:00' }
            }
        };

        const result = JsonLdGenerator.buildOpeningHours(formData);
        
        assert.assertTrue(result.length >= 3); // Should have separate specs for different hours
    });

    // Text sanitization
    test('Sanitize text - removes control characters', (assert) => {
        const input = 'Business\u0000Name\u001F';
        const result = JsonLdGenerator.sanitizeText(input);
        assert.assertEqual(result, 'Business Name');
    });

    test('Sanitize text - normalizes whitespace', (assert) => {
        const input = 'Business   \t\n   Name';
        const result = JsonLdGenerator.sanitizeText(input);
        assert.assertEqual(result, 'Business Name');
    });

    test('Sanitize text - preserves normal text', (assert) => {
        const input = 'Normal Business Name';
        const result = JsonLdGenerator.sanitizeText(input);
        assert.assertEqual(result, 'Normal Business Name');
    });

    // Validation
    test('Validate valid schema', (assert) => {
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Test Business',
            address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Main St',
                addressLocality: 'Test City',
                addressRegion: 'CA',
                postalCode: '12345'
            },
            telephone: '(555) 123-4567'
        };

        const result = JsonLdGenerator.validate(jsonLd);
        
        assert.assertTrue(result.isValid);
        assert.assertEqual(result.errors.length, 0);
    });

    test('Validate invalid schema - missing required fields', (assert) => {
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness'
            // missing name, address, telephone
        };

        const result = JsonLdGenerator.validate(jsonLd);
        
        assert.assertFalse(result.isValid);
        assert.assertTrue(result.errors.length > 0);
        assert.assertTrue(result.errors.some(e => e.includes('name')));
        assert.assertTrue(result.errors.some(e => e.includes('address')));
        assert.assertTrue(result.errors.some(e => e.includes('phone')));
    });

    test('Validate schema with warnings', (assert) => {
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Test Business',
            address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Main St',
                addressLocality: 'Test City',
                addressRegion: 'CA',
                postalCode: '12345'
            },
            telephone: '(555) 123-4567'
            // missing optional but recommended fields
        };

        const result = JsonLdGenerator.validate(jsonLd);
        
        assert.assertTrue(result.isValid);
        assert.assertTrue(result.warnings.length > 0);
    });

    // Formatting
    test('Format JSON with proper indentation', (assert) => {
        const jsonLd = { name: 'Test', address: { street: '123 Main St' } };
        const result = JsonLdGenerator.format(jsonLd);
        
        assert.assertTrue(result.includes('\n'));
        assert.assertTrue(result.includes('  '));
    });

    test('Minify JSON removes whitespace', (assert) => {
        const jsonLd = { name: 'Test', address: { street: '123 Main St' } };
        const result = JsonLdGenerator.minify(jsonLd);
        
        assert.assertFalse(result.includes('\n'));
        assert.assertFalse(result.includes('  '));
    });

    test('Generate HTML script tag', (assert) => {
        const jsonLd = { '@context': 'https://schema.org', '@type': 'LocalBusiness' };
        const result = JsonLdGenerator.toHtmlScript(jsonLd);
        
        assert.assertTrue(result.includes('<script type="application/ld+json">'));
        assert.assertTrue(result.includes('</script>'));
        assert.assertTrue(result.includes('@context'));
    });

    // Completeness score
    test('Calculate completeness score - minimal data', (assert) => {
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Test',
            address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Main St',
                addressLocality: 'City',
                addressRegion: 'State',
                postalCode: '12345'
            },
            telephone: '555-1234'
        };

        const score = JsonLdGenerator.getCompletenessScore(jsonLd);
        
        assert.assertTrue(score >= 60); // Should have decent score for required fields
        assert.assertTrue(score <= 100);
    });

    test('Calculate completeness score - complete data', (assert) => {
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Complete Business',
            address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Main St',
                addressLocality: 'City',
                addressRegion: 'State',
                postalCode: '12345'
            },
            telephone: '555-1234',
            url: 'https://example.com',
            email: 'info@example.com',
            description: 'Great business',
            geo: {
                '@type': 'GeoCoordinates',
                latitude: 37.7749,
                longitude: -122.4194
            },
            openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Monday',
                opens: '09:00',
                closes: '17:00'
            }],
            priceRange: '$$'
        };

        const score = JsonLdGenerator.getCompletenessScore(jsonLd);
        
        assert.assertTrue(score >= 90); // Should have high score for complete data
    });

    // Example data generation
    test('Generate example data', (assert) => {
        const example = JsonLdGenerator.generateExample();
        
        assert.assertHasProperty(example, 'businessName');
        assert.assertHasProperty(example, 'businessType');
        assert.assertHasProperty(example, 'phone');
        assert.assertHasProperty(example, 'streetAddress');
        assert.assertHasProperty(example, 'openingHours');
        
        // Verify opening hours structure
        assert.assertHasProperty(example.openingHours, 'monday');
        assert.assertHasProperty(example.openingHours.monday, 'open');
        assert.assertHasProperty(example.openingHours.monday, 'close');
    });
}