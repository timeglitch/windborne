//NOTE: this was only used for testing, just use the vercel server now

//start with node backend-proxy.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 4000;

const BACKEND_URL = "https://a.windbornesystems.com";

app.use(cors());

app.get('/treasure/:id', async (req, res) => {
    const { id } = req.params;
    const url = `${BACKEND_URL}/treasure/${id}`;
    console.log(`[Proxy] Requesting: ${url}`);
    try {
        const response = await fetch(url);
        console.log(`[Proxy] Response: ${response.status} ${response.statusText}`);
        if (!response.ok) {
            const text = await response.text();
            console.error(`[Proxy] Error fetching data: ${response.status} ${response.statusText}`);
            console.error(`[Proxy] Response body: ${text}`);
            return res.status(response.status).json({ error: 'Upstream error', status: response.status, statusText: response.statusText, body: text });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`[Proxy] Exception:`, error);
        res.status(500).json({ error: 'Failed to fetch data', details: error?.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
