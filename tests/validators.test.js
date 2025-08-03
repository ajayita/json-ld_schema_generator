/**
 * Tests for validators utility
 */

import { Validators } from '../src/utils/validators.js';

export function runValidatorTests(test) {
    // Required field validation
    test('Required field - valid input', (assert) => {
        const result = Validators.required('test value');
        assert.assertTrue(result.isValid);
        assert.assertEqual(result.message, 'This field is required');
    });

    test('Required field - empty input', (assert) => {
        const result = Validators.required('');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'This field is required');
    });

    test('Required field - whitespace only', (assert) => {
        const result = Validators.required('   ');
        assert.assertFalse(result.isValid);
    });

    // Email validation
    test('Email validation - valid email', (assert) => {
        const result = Validators.email('test@example.com');
        assert.assertTrue(result.isValid);
    });

    test('Email validation - invalid email', (assert) => {
        const result = Validators.email('invalid-email');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Please enter a valid email address');
    });

    test('Email validation - empty email (optional)', (assert) => {
        const result = Validators.email('');
        assert.assertTrue(result.isValid); // Email is optional
    });

    // URL validation
    test('URL validation - valid URL with protocol', (assert) => {
        const result = Validators.url('https://example.com');
        assert.assertTrue(result.isValid);
        assert.assertEqual(result.normalizedValue, 'https://example.com/');
    });

    test('URL validation - valid URL without protocol', (assert) => {
        const result = Validators.url('example.com');
        assert.assertTrue(result.isValid);
        assert.assertEqual(result.normalizedValue, 'https://example.com/');
    });

    test('URL validation - invalid URL', (assert) => {
        const result = Validators.url('not-a-url');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Please enter a valid URL');
    });

    // Phone validation
    test('Phone validation - valid US phone', (assert) => {
        const result = Validators.phone('(555) 123-4567');
        assert.assertTrue(result.isValid);
        assert.assertNotNull(result.normalizedValue);
    });

    test('Phone validation - valid international phone', (assert) => {
        const result = Validators.phone('+1 555 123 4567');
        assert.assertTrue(result.isValid);
    });

    test('Phone validation - too short', (assert) => {
        const result = Validators.phone('123');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Please enter a valid phone number');
    });

    test('Phone validation - too long', (assert) => {
        const result = Validators.phone('12345678901234567890');
        assert.assertFalse(result.isValid);
    });

    // Latitude validation
    test('Latitude validation - valid latitude', (assert) => {
        const result = Validators.latitude('45.5');
        assert.assertTrue(result.isValid);
        assert.assertEqual(result.normalizedValue, 45.5);
    });

    test('Latitude validation - out of range (too high)', (assert) => {
        const result = Validators.latitude('95');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Latitude must be between -90 and 90');
    });

    test('Latitude validation - out of range (too low)', (assert) => {
        const result = Validators.latitude('-95');
        assert.assertFalse(result.isValid);
    });

    test('Latitude validation - not a number', (assert) => {
        const result = Validators.latitude('not-a-number');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Latitude must be a number');
    });

    // Longitude validation
    test('Longitude validation - valid longitude', (assert) => {
        const result = Validators.longitude('-122.5');
        assert.assertTrue(result.isValid);
        assert.assertEqual(result.normalizedValue, -122.5);
    });

    test('Longitude validation - out of range', (assert) => {
        const result = Validators.longitude('190');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Longitude must be between -180 and 180');
    });

    // Postal code validation
    test('Postal code validation - valid US zip', (assert) => {
        const result = Validators.postalCode('12345', 'US');
        assert.assertTrue(result.isValid);
    });

    test('Postal code validation - valid US zip+4', (assert) => {
        const result = Validators.postalCode('12345-6789', 'US');
        assert.assertTrue(result.isValid);
    });

    test('Postal code validation - invalid US zip', (assert) => {
        const result = Validators.postalCode('123', 'US');
        assert.assertFalse(result.isValid);
    });

    test('Postal code validation - valid Canadian postal', (assert) => {
        const result = Validators.postalCode('K1A 0A6', 'CA');
        assert.assertTrue(result.isValid);
    });

    // Max length validation
    test('Max length validation - within limit', (assert) => {
        const result = Validators.maxLength('test', 10);
        assert.assertTrue(result.isValid);
    });

    test('Max length validation - exceeds limit', (assert) => {
        const result = Validators.maxLength('this is too long', 5);
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Maximum 5 characters allowed');
    });

    // Time validation
    test('Time validation - valid time', (assert) => {
        const result = Validators.time('14:30');
        assert.assertTrue(result.isValid);
    });

    test('Time validation - invalid time format', (assert) => {
        const result = Validators.time('2:30 PM');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Please enter time in HH:MM format');
    });

    test('Time validation - invalid time (25:00)', (assert) => {
        const result = Validators.time('25:00');
        assert.assertFalse(result.isValid);
    });

    // Time range validation
    test('Time range validation - valid range', (assert) => {
        const result = Validators.timeRange('09:00', '17:00');
        assert.assertTrue(result.isValid);
    });

    test('Time range validation - invalid range', (assert) => {
        const result = Validators.timeRange('17:00', '09:00');
        assert.assertFalse(result.isValid);
        assert.assertEqual(result.message, 'Opening time must be before closing time');
    });

    // Text sanitization
    test('Text sanitization - removes dangerous characters', (assert) => {
        const result = Validators.sanitizeText('<script>alert("xss")</script>');
        assert.assertFalse(result.includes('<script>'));
        assert.assertFalse(result.includes('</script>'));
    });

    test('Text sanitization - preserves normal text', (assert) => {
        const result = Validators.sanitizeText('Normal business name');
        assert.assertEqual(result, 'Normal business name');
    });

    // URL normalization
    test('URL normalization - adds https protocol', (assert) => {
        const result = Validators.normalizeUrl('example.com');
        assert.assertEqual(result, 'https://example.com');
    });

    test('URL normalization - preserves existing protocol', (assert) => {
        const result = Validators.normalizeUrl('http://example.com');
        assert.assertEqual(result, 'http://example.com');
    });

    test('URL normalization - handles empty input', (assert) => {
        const result = Validators.normalizeUrl('');
        assert.assertEqual(result, '');
    });

    // Phone number formatting
    test('Phone formatting - US number', (assert) => {
        const result = Validators.formatPhoneNumber('5551234567');
        assert.assertEqual(result, '(555) 123-4567');
    });

    test('Phone formatting - international number', (assert) => {
        const result = Validators.formatPhoneNumber('15551234567');
        assert.assertEqual(result, '+15551234567');
    });

    test('Phone formatting - preserves formatting', (assert) => {
        const result = Validators.formatPhoneNumber('(555) 123-4567');
        assert.assertEqual(result, '(555) 123-4567');
    });
}