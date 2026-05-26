import dotenv from 'dotenv';

dotenv.config();

const FIVETRAN_API_URL = 'https://api.fivetran.com/v1/connectors';

export async function deployFivetranConnector(configPayload: Record<string, any>) {
  const apiKey = process.env.FIVETRAN_API_KEY;
  const apiSecret = process.env.FIVETRAN_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Fivetran credentials missing from environment variables');
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const response = await fetch(FIVETRAN_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json;version=2'
    },
    body: JSON.stringify(configPayload)
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetail = JSON.stringify(errorJson);
    } catch (e) {
      // Ignore json parse error if not json
    }
    throw new Error(`Fivetran API Error: ${response.status} ${errorDetail}`);
  }

  return response.json();
}