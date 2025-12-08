require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Pray Player Backend API is running' });
});

// Contact creation endpoint
app.post('/api/create-contact', async (req, res) => {
    try {
        const { name, email, phone, optIn } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                error: 'Either email or phone is required'
            });
        }

        // Split name into first and last
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Prepare GHL API payload for v2.0 (Private Integration)
        const ghlPayload = {
            locationId: process.env.GHL_LOCATION_ID,
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
            phone: phone || 'N/A',
            locationId: process.env.GHL_LOCATION_ID
        });

        // Make API call to Go High Level v2.0 (Private Integration)
        const ghlResponse = await axios.post(
            'https://services.leadconnectorhq.com/contacts/',
            ghlPayload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GHL_PRIVATE_TOKEN}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ GHL Response:', ghlResponse.status);
        console.log('Contact ID:', ghlResponse.data.contact?.id);

        res.json({
            success: true,
            message: 'Contact created successfully',
            contactId: ghlResponse.data.contact?.id
        });

    } catch (error) {
        console.error('❌ Error creating contact:', error.response?.data || error.message);

        res.status(500).json({
            success: false,
            error: 'Failed to create contact',
            details: error.response?.data || error.message
        });
    }
});

// Prayer journey opt-in endpoint
app.post('/api/opt-in-prayer', async (req, res) => {
    try {
        const { phone, contactId } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Phone is required' });
        }

        const headers = {
            'Authorization': `Bearer ${process.env.GHL_PRIVATE_TOKEN}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        };

        let finalContactId = contactId || null;

        if (!finalContactId) {
            const searchResp = await axios.get('https://services.leadconnectorhq.com/contacts/', {
                headers: {
                    'Authorization': headers['Authorization'],
                    'Version': headers['Version']
                },
                params: {
                    locationId: process.env.GHL_LOCATION_ID,
                    query: phone
                }
            });
            const contacts = searchResp.data && searchResp.data.contacts ? searchResp.data.contacts : [];
            if (contacts.length > 0) finalContactId = contacts[0].id;
        }

        const tags = ['30-Day Prayer Subscriber'];

        if (finalContactId) {
            const updatePayload = {
                locationId: process.env.GHL_LOCATION_ID,
                phone: phone,
                tags: tags
            };
            const updateResp = await axios.put(`https://services.leadconnectorhq.com/contacts/${finalContactId}`, updatePayload, { headers });
            return res.json({ success: true, message: 'Prayer journey opt-in saved', contactId: finalContactId, action: 'updated' });
        }

        const createPayload = {
            locationId: process.env.GHL_LOCATION_ID,
            phone: phone,
            source: 'Music Player - Pray',
            tags: tags
        };
        const createResp = await axios.post('https://services.leadconnectorhq.com/contacts/', createPayload, { headers });
        return res.json({ success: true, message: 'Prayer journey opt-in created', contactId: createResp.data.contact?.id || null, action: 'created' });

    } catch (error) {
        console.error('❌ Prayer opt-in error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Failed to save prayer opt-in', details: error.response?.data || error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
========================================
🚀 Pray Player Backend Server Running
========================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
GHL Location ID: ${process.env.GHL_LOCATION_ID ? '✓ Set' : '✗ Missing'}
GHL Private Token: ${process.env.GHL_PRIVATE_TOKEN ? '✓ Set' : '✗ Missing'}
API Version: 2021-07-28 (v2.0)
========================================
    `);
});
