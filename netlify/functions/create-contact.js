// Netlify serverless function for GHL Private Integration
// Using native fetch instead of axios for Netlify compatibility

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, phone, optIn, preference } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Email is required'
        })
      };
    }

    let firstName;
    let lastName;
    if (name && typeof name === 'string' && name.trim().length > 0) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0] || undefined;
      lastName = nameParts.slice(1).join(' ') || undefined;
    }

    // Your GHL Private Integration credentials (from environment variables)
    const GHL_PRIVATE_TOKEN = process.env.GHL_PRIVATE_TOKEN;
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    // Determine tags based on user preference
    const tags = ['Pray Player Form'];

    if (preference === 'sms') {
      tags.push('SMS');
      tags.push('SMS Opted In');
    } else if (preference === 'email') {
      tags.push('Email');
    } else if (preference === 'both') {
      tags.push('Both');
      tags.push('SMS Opted In');
    }

    // Prepare contact data for GHL API v2.0
    const contactData = {
      locationId: GHL_LOCATION_ID,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      source: 'Music Player - Pray',
      tags: tags
    };

    console.log('Creating contact in GHL (Private Integration):', {
      name: name,
      email: email || 'N/A',
      phone: phone || 'N/A'
    });

    let response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(contactData)
    });

    let data = await response.json();

    const isDupStatus = response.status === 400 || response.status === 409;
    const msg = (data && (data.message || data.error)) || '';
    const looksDuplicate = /already exists|duplicate|exists/i.test(msg);

    if (isDupStatus && looksDuplicate) {
      console.log('Contact exists, searching to update...');

      // Search for existing contact by email or phone
      const searchQuery = email || phone;
      const searchResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
            'Version': '2021-07-28'
          }
        }
      );

      const searchData = await searchResponse.json();

      if (searchData.contacts && searchData.contacts.length > 0) {
        const existingContact = searchData.contacts[0];
        console.log('Found existing contact:', existingContact.id);

        // Update the existing contact
        const updateResponse = await fetch(
          `https://services.leadconnectorhq.com/contacts/${existingContact.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28'
            },
            body: JSON.stringify(contactData)
          }
        );

        data = await updateResponse.json();

        if (updateResponse.ok) {
          console.log('✅ Contact updated:', existingContact.id);
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              contact: data,
              message: 'Contact updated successfully',
              contactId: existingContact.id,
              action: 'updated'
            })
          };
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          contact: null,
          message: 'Duplicate detected, proceeding',
          contactId: searchData.contacts && searchData.contacts[0] ? searchData.contacts[0].id : null,
          action: 'duplicate_bypass'
        })
      };
    }

    // If creation was successful
    if (response.ok) {
      console.log('✅ Contact created:', data.contact?.id);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          contact: data,
          message: 'Contact created successfully',
          contactId: data.contact?.id,
          action: 'created'
        })
      };
    }

    console.error('❌ GHL API Error:', data);
    return {
      statusCode: response.status,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create or update contact',
        message: data && (data.message || (data.details && data.details.message)) || undefined,
        details: data
      })
    };

  } catch (error) {
    console.error('❌ Error creating contact:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create contact',
        message: error && (error.message || undefined),
        details: error.message
      })
    };
  }
};
