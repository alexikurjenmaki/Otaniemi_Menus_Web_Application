export default async function handler(req, res) {
  const url = req.query.url;  // Get the URL parameter from the query

  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    // Make a fetch request to the URL passed in the query parameter
    const response = await fetch(url);
    const data = await response.json();
    
    // Send the response data back to the frontend
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}