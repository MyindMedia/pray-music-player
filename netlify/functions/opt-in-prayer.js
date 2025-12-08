exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { phone, contactId } = JSON.parse(event.body || '{}');

    if (!phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Phone is required' })
      };
    }

    const GHL_PRIVATE_TOKEN = process.env.GHL_PRIVATE_TOKEN;
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    if (!GHL_PRIVATE_TOKEN || !GHL_LOCATION_ID) {
      console.error('Missing GHL credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: 'Server configuration error' })
      };
    }

    const TAG_NAME = '30-Day Prayer Subscriber';

    const headers = {
      'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    };

    let finalContactId = contactId || null;

    // If no contactId provided, search by phone number
    if (!finalContactId) {
      try {
        // Try searching by phone first
        const searchResp = await fetch(
          `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(phone)}`,
          { headers: { 'Authorization': headers.Authorization, 'Version': headers.Version } }
        );
        const searchData = await searchResp.json();

        if (searchData && Array.isArray(searchData.contacts) && searchData.contacts.length > 0) {
          // Find contact with matching phone
          const matchingContact = searchData.contacts.find(c => {
            const contactPhone = c.phone?.replace(/\D/g, '');
            const searchPhone = phone.replace(/\D/g, '');
            return contactPhone && searchPhone && contactPhone.includes(searchPhone.slice(-10));
          });

          if (matchingContact) {
            finalContactId = matchingContact.id;
            console.log('Found existing contact by phone:', finalContactId);
          } else if (searchData.contacts.length > 0) {
            // Fallback to first result if no exact phone match
            finalContactId = searchData.contacts[0].id;
            console.log('Using first search result:', finalContactId);
          }
        }
      } catch (searchErr) {
        console.error('Error searching for contact:', searchErr);
        // Continue - will create new contact if search fails
      }
    }

    // Update existing contact with tag
    if (finalContactId) {
      try {
        console.log('Attempting to update contact:', finalContactId);

        const updateData = {
          phone: phone,
          tags: [TAG_NAME]
        };

        console.log('Update payload:', JSON.stringify(updateData));

        const updateResp = await fetch(
          `https://services.leadconnectorhq.com/contacts/${finalContactId}`,
          { method: 'PUT', headers, body: JSON.stringify(updateData) }
        );

        const updateJson = await updateResp.json();

        console.log('Update response status:', updateResp.status);
        console.log('Update response body:', JSON.stringify(updateJson));

        if (!updateResp.ok) {
          console.error('Failed to update contact:', updateJson);

          // Check if it's a duplicate tag error (which is actually OK)
          const errorMsg = JSON.stringify(updateJson).toLowerCase();
          if (errorMsg.includes('already') || errorMsg.includes('duplicate')) {
            console.log('Contact already has tag, treating as success');
            return {
              statusCode: 200,
              body: JSON.stringify({
                success: true,
                message: 'Prayer journey opt-in already saved',
                contactId: finalContactId,
                action: 'already_tagged'
              })
            };
          }

          return {
            statusCode: updateResp.status,
            body: JSON.stringify({
              success: false,
              error: 'Failed to update contact',
              details: updateJson
            })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Prayer journey opt-in saved',
            contactId: finalContactId,
            action: 'updated'
          })
        };
      } catch (updateErr) {
        console.error('Error updating contact:', updateErr);
        console.error('Error stack:', updateErr.stack);
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: 'Failed to update contact',
            details: updateErr.message
          })
        };
      }
    }

    // Create new contact if not found
    try {
      const createData = {
        phone: phone,
        source: 'Music Player - Pray - 30 Day Journey',
        tags: [TAG_NAME]
      };

      const createResp = await fetch(
        `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}`,
        { method: 'POST', headers, body: JSON.stringify(createData) }
      );
      const createJson = await createResp.json();

      console.log('Create response:', createResp.status, createJson);

      if (!createResp.ok) {
        console.error('Failed to create contact:', createJson);
        return {
          statusCode: createResp.status,
          body: JSON.stringify({
            success: false,
            error: 'Failed to create contact',
            details: createJson
          })
        };
      }

      const newContactId = createJson.contact?.id || null;

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Prayer journey opt-in created',
          contactId: newContactId,
          action: 'created'
        })
      };
    } catch (createErr) {
      console.error('Error creating contact:', createErr);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Failed to create contact',
          details: createErr.message
        })
      };
    }

  } catch (err) {
    console.error('Server error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Server error',
        details: err && (err.message || err.toString())
      })
    };
  }
}