import fetch from 'node-fetch';

export default async function handler(req, res) {

    console.log(`[Proxy] Incoming request: ${req.url}`);
    const {
        query: { id },
        method,
    } = req;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    if (!id) {
        res.status(400).json({ error: 'Missing id parameter' });
        return;
    }

    const url = `https://a.windbornesystems.com/treasure/${id}.json`;
    console.log(`[Proxy] Requesting: ${url}`);
    try {
        const response = await fetch(url);
        console.log(`[Proxy] Response: ${response.status} ${response.statusText}`);
        if (!response.ok) {
            const text = await response.text();
            console.error(`[Proxy] Error fetching data: ${response.status} ${response.statusText}`);
            console.error(`[Proxy] Response body: ${text}`);
            res.status(response.status).json({ error: 'Upstream error', status: response.status, statusText: response.statusText, body: text });
            return;
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error(`[Proxy] Exception:`, error);
        res.status(500).json({ error: 'Failed to fetch data', details: error?.message });
    }
}
