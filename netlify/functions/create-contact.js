// Netlify serverless function for GHL Private Integration
const axios = require('axios');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const { name, email, phone, optIn } = JSON.parse(event.body);

    // Validate required fields
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Name is required'
        })
      };
    }

    if (!email && !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Either email or phone is required'
        })
      };
    }

    // Split name into first and last
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Your GHL Private Integration credentials (from environment variables)
    const GHL_PRIVATE_TOKEN = process.env.GHL_PRIVATE_TOKEN;
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    // Prepare contact data for GHL API v2.0
    const contactData = {
      locationId: GHL_LOCATION_ID,
      email: email || undefined,
      firstName: firstName,
      lastName: lastName,
      phone: phone || undefined,
      source: 'Music Player - Pray',
      tags: ['Pray Player Form']
    };

    console.log('Creating contact in GHL (Private Integration):', {
      name: name,
      email: email || 'N/A',
      phone: phone || 'N/A'
    });

    // Send to Go High Level using Private Integration
    const response = await axios.post(
      'https://services.leadconnectorhq.com/contacts/',
      contactData,
      {
        headers: {
          'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    );

    console.log('✅ Contact created:', response.data.contact?.id);

    // Success!
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        contact: response.data,
        message: 'Contact created successfully',
        contactId: response.data.contact?.id
      })
    };

  } catch (error) {
    console.error('❌ Error creating contact:', error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create contact',
        details: error.response?.data || error.message
      })
    };
  }
};
