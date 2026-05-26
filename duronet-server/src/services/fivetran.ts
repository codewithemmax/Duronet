import dotenv from 'dotenv';

dotenv.config();



export async function deployFivetranConnector(configPayload: Record<string, any>) {
  const apiKey = process.env.FIVETRAN_API_KEY;
  const apiSecret = process.env.FIVETRAN_API_SECRET;
  const groupId = process.env.FIVETRAN_GROUP_ID; // Pull the ID from env

  if (!apiKey || !apiSecret || !groupId) {
    throw new Error('Fivetran credentials or Group ID missing from environment variables');
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  // We wrap the AI's config inside Fivetran's required root structure
  const fivetranPayload = {
    service: configPayload.service || 'postgres', // The data source type
    group_id: groupId,                            // The connection ID to your destination!
    trust_certificates: true,
    run_setup_tests: false,                       // Bypass strict live-checks for the hackathon
    config: configPayload.config || configPayload // The credentials the AI generated
  };

  const response = await fetch('https://api.fivetran.com/v1/connectors', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json;version=2'
    },
    body: JSON.stringify(fivetranPayload) // Send the wrapped payload
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

  const result = await response.json();
  
  // Fivetran will return the new connector's ID inside result.data.id
  console.log("SUCCESS! New Fivetran Connector ID:", result?.data?.id);
  
  return { success: true, connectorId: result?.data?.id };
}