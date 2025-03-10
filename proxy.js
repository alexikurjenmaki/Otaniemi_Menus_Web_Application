export default async function handler(req, res) {
    const url = req.query.url;  // Get the URL parameter from the query
  
    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }
  
    try {
      // Make a request to the target URL (kitchen.kanttiinit.fi)
      const response = await fetch(url);
      const data = await response.json();
      
      // Set CORS headers to allow your frontend to receive the response
      res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins, or specify your domain
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  }