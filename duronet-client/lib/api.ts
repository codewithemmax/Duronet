/**
 * DuroNet API Client
 * Fetching utilities for backend communication
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface FdaAlert {
  id: string;
  date: string;
  product: string;
  manufacturer: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface GpoMetric {
  supplierId: string;
  supplierName: string;
  reliabilityScore: number;
  purchaseVolume: number;
  leadTime: number;
  region: string;
}

interface AIAnalysisResponse {
  riskAnalysis: string;
  alternateManufacturerRecommendation: string;
  fivetranConfigDraft: {
    service: string;
    group_id: string;
    paused?: boolean;
    sync_frequency?: number;
    config: Record<string, any>;
  };
}

/**
 * Fetch all FDA alerts from the backend
 */
export async function fetchFdaAlerts(): Promise<FdaAlert[]> {
  try {
    const response = await fetch(`${API_BASE}/api/fda-alerts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch FDA alerts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching FDA alerts:', error);
    throw error;
  }
}

/**
 * Fetch GPO metrics from the backend
 */
export async function fetchGpoMetrics(): Promise<GpoMetric[]> {
  try {
    const response = await fetch(`${API_BASE}/api/gpo-metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch GPO metrics: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GPO metrics:', error);
    throw error;
  }
}

/**
 * Send an alert to the AI service for analysis
 * Returns structured risk analysis and Fivetran config draft
 */
export async function analyzeAlert(alert: FdaAlert): Promise<AIAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alert }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze alert: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing alert:', error);
    throw error;
  }
}

/**
 * Fetch combined logistics status (both alerts and metrics)
 */
export async function fetchLogisticsStatus(): Promise<{
  alerts: FdaAlert[];
  metrics: GpoMetric[];
}> {
  try {
    const response = await fetch(`${API_BASE}/api/logistics/status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch logistics status: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching logistics status:', error);
    throw error;
  }
}

/**
 * Execute the drafted Fivetran config deployment
 */
export async function deployFivetranConfig(config: Record<string, any>): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to deploy Fivetran config: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error deploying config:', error);
    throw error;
  }
}
