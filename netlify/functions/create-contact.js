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

    // First, try to create the contact
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

    // If contact already exists (400 error), search for it and update instead
    if (response.status === 400 && data.message && data.message.includes('already exists')) {
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

    // If we got here, something else went wrong
    console.error('❌ GHL API Error:', data);
    return {
      statusCode: response.status,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create or update contact',
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
        details: error.message
      })
    };
  }
};
