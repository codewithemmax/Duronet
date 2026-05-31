import dotenv from 'dotenv';

dotenv.config();

export async function deployFivetranConnector(configPayload: Record<string, any>) {
  if (!configPayload || typeof configPayload !== 'object') {
    throw new Error('Invalid Fivetran payload: config must be a JSON object');
  }

  const validServices = ['google_sheets', 'postgres', 'mysql', 'sftp', 'salesforce', 'stripe'];
  const safeService = validServices.includes(configPayload.service)
    ? configPayload.service
    : 'google_sheets';

  const apiKey = process.env.FIVETRAN_API_KEY;
  const apiSecret = process.env.FIVETRAN_API_SECRET;
  const groupId = process.env.FIVETRAN_GROUP_ID;

  if (!apiKey || !apiSecret) {
    throw new Error('Fivetran API key or secret missing from environment variables');
  }

  if (!groupId) {
    throw new Error('Fivetran Group ID missing from environment variables');
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const randomSchemaId = `duro_pipeline_${Math.floor(Math.random() * 10000)}`;

  if (!configPayload.config || typeof configPayload.config !== 'object') {
    throw new Error('Invalid Fivetran payload: config object is required');
  }

  const finalConfig = Object.keys(configPayload.config || {}).length > 0
    ? {
        schema: configPayload.config.schema || randomSchemaId,
        table: configPayload.config.table || 'duro_table_data',
        ...configPayload.config,
      }
    : {
        schema: randomSchemaId,
        table: 'duro_table_data',
        sheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        named_range: 'Sheet1!A1:Z1000',
      };

  const fivetranPayload = {
    service: safeService,
    group_id: groupId,
    trust_certificates: true,
    run_setup_tests: false,
    config: finalConfig,
  };

  const response = await fetch('https://api.fivetran.com/v1/connectors', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      Accept: 'application/json;version=2',
    },
    body: JSON.stringify(fivetranPayload),
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetail = JSON.stringify(errorJson);
    } catch (e) {
      // Ignore json parse errors when response is not JSON.
    }
    throw new Error(`Fivetran API Error: ${response.status} ${errorDetail}`);
  }

  const result = await response.json();
  const connectorId = result?.data?.id;

  if (!connectorId) {
    throw new Error('Fivetran response missing connector ID');
  }

  console.log('SUCCESS! New Fivetran Connector ID:', connectorId);
  return { success: true, connectorId };
}