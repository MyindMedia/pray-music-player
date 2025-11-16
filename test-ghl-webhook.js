// Test script to verify Go High Level webhook integration
// Run this with: node test-ghl-webhook.js

const webhookURL = 'https://hooks.gohighlevel.com/webhook/pit-a357808c-5424-43ff-8691-270f3b487942';

// Test payload
const testPayload = {
    firstName: 'Test',
    lastName: 'User',
    name: 'Test User',
    email: 'test@myindsound.com',
    phone: '+12345678900',
    source: 'Pray Music Player - Myind Sound',
    tags: 'pray-player,music-fan,opted-in',
    customField: {
        opt_in: 'Yes',
        timestamp: new Date().toISOString(),
        player_source: 'Pray Music Player'
    }
};

console.log('========================================');
console.log('Testing Go High Level Webhook Integration');
console.log('========================================\n');
console.log('Webhook URL:', webhookURL);
console.log('\nTest Payload:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('\n========================================');
console.log('Sending request...\n');

fetch(webhookURL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testPayload)
})
.then(async response => {
    console.log('========================================');
    console.log('RESPONSE RECEIVED');
    console.log('========================================');
    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Success:', response.ok);

    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    let responseBody;
    if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
        console.log('\nResponse Body (JSON):');
        console.log(JSON.stringify(responseBody, null, 2));
    } else {
        responseBody = await response.text();
        console.log('\nResponse Body (Text):');
        console.log(responseBody);
    }

    console.log('\n========================================');
    if (response.ok) {
        console.log('✅ SUCCESS! Contact should be created in GHL');
        console.log('\nCheck Go High Level for:');
        console.log('- Contact Name: Test User');
        console.log('- Email: test@myindsound.com');
        console.log('- Phone: +12345678900');
        console.log('- Source: Pray Music Player - Myind Sound');
        console.log('- Tags: pray-player, music-fan, opted-in');
    } else {
        console.log('❌ FAILED! Contact was not created');
        console.log('Please check the error message above');
    }
    console.log('========================================\n');
})
.catch(error => {
    console.log('\n========================================');
    console.log('❌ ERROR OCCURRED');
    console.log('========================================');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    console.log('========================================\n');
});
