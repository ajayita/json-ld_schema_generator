/**
 * Tests for geocoder utility
 */

import { Geocoder } from '../src/utils/geocoder.js';

export function runGeocoderTests(test) {
    // Coordinate validation
    test('Validate valid coordinates', (assert) => {
        const result = Geocoder.validateCoordinates('37.7749', '-122.4194');
        
        assert.assertTrue(result.isValid);
        assert.assertEqual(result.errors.length, 0);
        assert.assertNotNull(result.coordinates);
        assert.assertEqual(result.coordinates.latitude, 37.7749);
        assert.assertEqual(result.coordinates.longitude, -122.4194);
    });

    test('Validate invalid latitude - too high', (assert) => {
        const result = Geocoder.validateCoordinates('95', '-122.4194');
        
        assert.assertFalse(result.isValid);
        assert.assertTrue(result.errors.length > 0);
        assert.assertTrue(result.errors.some(e => e.includes('Latitude must be between -90 and 90')));
        assert.assertNull(result.coordinates);
    });

    test('Validate invalid latitude - too low', (assert) => {
        const result = Geocoder.validateCoordinates('-95', '-122.4194');
        
        assert.assertFalse(result.isValid);
        assert.assertTrue(result.errors.some(e => e.includes('Latitude must be between -90 and 90')));
    });

    test('Validate invalid longitude - too high', (assert) => {
        const result = Geocoder.validateCoordinates('37.7749', '190');
        
        assert.assertFalse(result.isValid);
        assert.assertTrue(result.errors.some(e => e.includes('Longitude must be between -180 and 180')));
    });

    test('Validate invalid longitude - too low', (assert) => {
        const result = Geocoder.validateCoordinates('37.7749', '-190');
        
        assert.assertFalse(result.isValid);
        assert.assertTrue(result.errors.some(e => e.includes('Longitude must be between -180 and 180')));
    });

    test('Validate non-numeric coordinates', (assert) => {
        const result = Geocoder.validateCoordinates('not-a-number', '-122.4194');
        
        assert.assertFalse(result.isValid);
        assert.assertTrue(result.errors.some(e => e.includes('Latitude must be a valid number')));
    });

    test('Validate edge case coordinates', (assert) => {
        // Test exact boundaries
        const result1 = Geocoder.validateCoordinates('90', '180');
        assert.assertTrue(result1.isValid);
        
        const result2 = Geocoder.validateCoordinates('-90', '-180');
        assert.assertTrue(result2.isValid);
        
        const result3 = Geocoder.validateCoordinates('0', '0');
        assert.assertTrue(result3.isValid);
    });

    // Distance calculation
    test('Calculate distance between same points', (assert) => {
        const distance = Geocoder.calculateDistance(37.7749, -122.4194, 37.7749, -122.4194);
        assert.assertEqual(distance, 0);
    });

    test('Calculate distance between known points', (assert) => {
        // Distance between San Francisco and Los Angeles (approximately 559 km)
        const sf_lat = 37.7749, sf_lon = -122.4194;
        const la_lat = 34.0522, la_lon = -118.2437;
        
        const distance = Geocoder.calculateDistance(sf_lat, sf_lon, la_lat, la_lon);
        
        // Allow some tolerance in calculation
        assert.assertTrue(distance > 500);
        assert.assertTrue(distance < 600);
    });

    test('Calculate distance across equator', (assert) => {
        const distance = Geocoder.calculateDistance(10, 0, -10, 0);
        
        // Approximately 2223 km (20 degrees * 111 km/degree)
        assert.assertTrue(distance > 2000);
        assert.assertTrue(distance < 2500);
    });

    test('Calculate distance across date line', (assert) => {
        const distance = Geocoder.calculateDistance(0, 179, 0, -179);
        
        // Should be about 222 km (2 degrees * 111 km/degree)
        assert.assertTrue(distance > 200);
        assert.assertTrue(distance < 250);
    });

    // Address building
    test('Build address string from form data', (assert) => {
        const formData = {
            streetAddress: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US'
        };

        const result = Geocoder.buildAddressString(formData);
        const expected = '123 Main Street, San Francisco, CA, 94102, US';
        
        assert.assertEqual(result, expected);
    });

    test('Build address string with missing fields', (assert) => {
        const formData = {
            city: 'San Francisco',
            state: 'CA'
        };

        const result = Geocoder.buildAddressString(formData);
        const expected = 'San Francisco, CA';
        
        assert.assertEqual(result, expected);
    });

    test('Build address string with empty form data', (assert) => {
        const formData = {};
        const result = Geocoder.buildAddressString(formData);
        
        assert.assertEqual(result, '');
    });

    // Coordinate conversion
    test('Convert degrees to radians', (assert) => {
        const result = Geocoder.toRadians(180);
        assert.assertTrue(Math.abs(result - Math.PI) < 0.0001);
        
        const result2 = Geocoder.toRadians(90);
        assert.assertTrue(Math.abs(result2 - Math.PI/2) < 0.0001);
        
        const result3 = Geocoder.toRadians(0);
        assert.assertEqual(result3, 0);
    });

    // Geocoder instance methods
    test('Geocoder normalize address', (assert) => {
        const geocoder = new Geocoder();
        
        const result = geocoder.normalizeAddress('  123 Main Street, San Francisco, CA  ');
        assert.assertEqual(result, '123 main street san francisco ca');
    });

    test('Geocoder normalize address - special characters', (assert) => {
        const geocoder = new Geocoder();
        
        const result = geocoder.normalizeAddress('123 Main St., #456');
        assert.assertEqual(result, '123 main st 456');
    });

    test('Geocoder cache operations', (assert) => {
        const geocoder = new Geocoder();
        
        // Test initial state
        const stats = geocoder.getCacheStats();
        assert.assertEqual(stats.size, 0);
        assert.assertTrue(Array.isArray(stats.providers));
        
        // Test cache clearing
        geocoder.clearCache();
        const statsAfterClear = geocoder.getCacheStats();
        assert.assertEqual(statsAfterClear.size, 0);
    });

    test('Geocoder rate limiting check', (assert) => {
        const geocoder = new Geocoder();
        
        // Should allow first request
        const result1 = geocoder.checkRateLimit('nominatim');
        assert.assertTrue(result1);
        
        // Should block second request (1 per second limit)
        const result2 = geocoder.checkRateLimit('nominatim');
        assert.assertFalse(result2);
    });

    test('Geocoder rate limiting reset', (assert) => {
        const geocoder = new Geocoder();
        
        // Use up the rate limit
        geocoder.checkRateLimit('nominatim');
        assert.assertFalse(geocoder.checkRateLimit('nominatim'));
        
        // Wait for rate limit to reset (simulate by manually resetting)
        geocoder.rateLimit.nominatim.resetTime = Date.now() - 1000;
        const result = geocoder.checkRateLimit('nominatim');
        assert.assertTrue(result);
    });

    test('Geocoder unknown provider rate limit', (assert) => {
        const geocoder = new Geocoder();
        
        // Should allow unknown providers (no rate limit configured)
        const result = geocoder.checkRateLimit('unknown-provider');
        assert.assertTrue(result);
    });

    // Nominatim address component parsing
    test('Parse Nominatim address components', (assert) => {
        const geocoder = new Geocoder();
        const nominatimAddress = {
            house_number: '123',
            road: 'Main Street',
            city: 'San Francisco',
            state: 'California',
            postcode: '94102',
            country: 'United States',
            country_code: 'us'
        };

        const result = geocoder.parseNominatimComponents(nominatimAddress);
        
        assert.assertEqual(result.street_number, '123');
        assert.assertEqual(result.street_name, 'Main Street');
        assert.assertEqual(result.city, 'San Francisco');
        assert.assertEqual(result.state, 'California');
        assert.assertEqual(result.postal_code, '94102');
        assert.assertEqual(result.country, 'United States');
        assert.assertEqual(result.country_code, 'US');
    });

    test('Parse Nominatim address components - missing fields', (assert) => {
        const geocoder = new Geocoder();
        const nominatimAddress = {
            road: 'Main Street',
            city: 'San Francisco'
        };

        const result = geocoder.parseNominatimComponents(nominatimAddress);
        
        assert.assertEqual(result.street_number, '');
        assert.assertEqual(result.street_name, 'Main Street');
        assert.assertEqual(result.city, 'San Francisco');
        assert.assertEqual(result.state, '');
    });

    test('Parse Nominatim address components - null input', (assert) => {
        const geocoder = new Geocoder();
        const result = geocoder.parseNominatimComponents(null);
        
        assert.assertDeepEqual(result, {});
    });

    // Accuracy estimation
    test('Estimate geocoding accuracy - high', (assert) => {
        const geocoder = new Geocoder();
        const result = { type: 'house', osm_type: 'node' };
        
        const accuracy = geocoder.estimateAccuracy(result);
        assert.assertEqual(accuracy, 'high');
    });

    test('Estimate geocoding accuracy - medium', (assert) => {
        const geocoder = new Geocoder();
        const result = { type: 'street', osm_type: 'way' };
        
        const accuracy = geocoder.estimateAccuracy(result);
        assert.assertEqual(accuracy, 'medium');
    });

    test('Estimate geocoding accuracy - low', (assert) => {
        const geocoder = new Geocoder();
        const result = { type: 'city', osm_type: 'relation' };
        
        const accuracy = geocoder.estimateAccuracy(result);
        assert.assertEqual(accuracy, 'low');
    });

    test('Estimate geocoding accuracy - unknown', (assert) => {
        const geocoder = new Geocoder();
        const result = { type: 'unknown' };
        
        const accuracy = geocoder.estimateAccuracy(result);
        assert.assertEqual(accuracy, 'low');
    });
}