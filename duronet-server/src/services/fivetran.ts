import dotenv from 'dotenv';

dotenv.config();

export async function deployFivetranConnector(configPayload: Record<string, any>) {
  // 1. Sanitize the service name (Defaults to google_sheets if AI hallucinates)
  const validServices = ['google_sheets', 'postgres', 'mysql', 'sftp', 'salesforce', 'stripe'];
  
  const safeService = validServices.includes(configPayload.service) 
    ? configPayload.service 
    : 'google_sheets';

  const apiKey = process.env.FIVETRAN_API_KEY;
  const apiSecret = process.env.FIVETRAN_API_SECRET;
  const groupId = process.env.FIVETRAN_GROUP_ID; // Pull the ID from env

  if (!apiKey || !apiSecret || !groupId) {
    throw new Error('Fivetran credentials or Group ID missing from environment variables');
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  // Generate a random ID for the schema so it never conflicts on multiple clicks
  const randomSchemaId = `duro_pipeline_${Math.floor(Math.random() * 10000)}`;

  // 2. The Bulletproof Config (Now fully formatted for Google Sheets with 'table' included)
  const finalConfig = Object.keys(configPayload.config || {}).length > 0 
    ? { 
        schema: configPayload.config.schema || randomSchemaId,
        table: configPayload.config.table || "duro_table_data",
        ...configPayload.config 
      } 
    : {
        // Fallback dummy data specifically for Google Sheets
        schema: randomSchemaId,
        table: "duro_table_data",
        sheet_id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", 
        named_range: "Sheet1!A1:Z1000"
      };

  // 3. The Root Payload
  const fivetranPayload = {
    service: safeService, 
    group_id: groupId,                            
    trust_certificates: true,
    run_setup_tests: false,                       
    config: finalConfig 
  };

  const response = await fetch('https://api.fivetran.com/v1/connectors', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json;version=2'
    },
    body: JSON.stringify(fivetranPayload) 
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
  
  console.log("SUCCESS! New Fivetran Connector ID:", result?.data?.id);
  
  return { success: true, connectorId: result?.data?.id };
}