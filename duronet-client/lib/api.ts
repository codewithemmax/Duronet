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

interface DrugShortage {
  id: string;
  drugName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedRegions: string[];
  shortageReason: string;
  estimatedResolution: string;
}

interface InventoryItem {
  currentStock: number;
  dailyBurnRate: number;
  daysOfSupply: number;
}

interface HospitalTelemetry {
  hospitalId: string;
  name: string;
  region: string;
  inventory: Record<string, InventoryItem>;
  bedCapacity: string;
}

interface InventoryStatus {
  shortages: DrugShortage[];
  telemetry: HospitalTelemetry[];
}

export type PredictionStatus = 'CRITICAL_SHORTAGE_IMMINENT' | 'STABLE' | 'DATA_UNAVAILABLE';

export interface InventoryPrediction {
  hospitalId: string;
  name: string;
  region: string;
  drugName: string;
  currentInventory: number;
  dailyBurnRate: number;
  daysOfSupplyRemaining: number | null;
  status: PredictionStatus;
}

export interface InventoryPredictionResponse {
  drugName: string;
  livePatientInflux: number;
  dosagePerPatient: number;
  thresholdDays: number;
  dailyBurnRate: number;
  predictions: InventoryPrediction[];
  timestamp: string;
}

interface SurplusData {
  hub: string;
  totalStock: number;
  committed: number;
  available: number;
  requested: number;
  isFeasible: boolean;
}

interface AIAnalysisResponse {
  riskAnalysis: string;
  alternateManufacturerRecommendation: string;
  surplusData: SurplusData;
  fivetranConfigDraft: {
    service: string;
    group_id: string;
    paused?: boolean;
    sync_frequency?: number;
    config: Record<string, any>;
  };
  fivetranPayload: {
    service: string;
    config: {
      schema: string;
      table: string;
      sheet_id: string;
      named_range: string;
    };
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
 * Fetch inventory status (hospital telemetry + drug shortages)
 */
export async function fetchInventoryStatus(): Promise<InventoryStatus> {
  try {
    const response = await fetch(`${API_BASE}/api/inventory/status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory status: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory status:', error);
    throw error;
  }
}

export interface SearchResult {
  id: string;
  drugName: string;
  severity: string;
  affectedRegions: string[];
  shortageReason: string;
  estimatedResolution: string;
}

export type SearchKind = 'shortage' | 'alert';

export interface UnifiedSearchResult extends SearchResult {
  kind: SearchKind;
  // for alerts, product/manufacturer/date are available
  product?: string;
  manufacturer?: string;
  date?: string;
}

/**
 * Search both shortages (via AI search) and the FDA alerts stream, returning combined matches.
 */
export async function searchAll(query: string): Promise<UnifiedSearchResult[]> {
  try {
    const [shortagesResp, alerts] = await Promise.all([
      searchShortages(query).catch(() => [] as SearchResult[]),
      fetchFdaAlerts().catch(() => [] as FdaAlert[]),
    ]);

    const shortageResults: UnifiedSearchResult[] = shortagesResp.map((s) => ({
      ...s,
      kind: 'shortage',
    }));

    const normalized = query.trim().toLowerCase();
    const alertMatches = alerts
      .filter((a) =>
        a.product.toLowerCase().includes(normalized) ||
        a.reason.toLowerCase().includes(normalized) ||
        a.manufacturer.toLowerCase().includes(normalized)
      )
      .map((a) => ({
        id: `alert-${a.id}`,
        drugName: a.product,
        severity: a.severity,
        affectedRegions: [],
        shortageReason: a.reason,
        estimatedResolution: '',
        kind: 'alert',
        product: a.product,
        manufacturer: a.manufacturer,
        date: a.date,
      } as UnifiedSearchResult));

    // Merge shortages first, then alerts
    return [...shortageResults, ...alertMatches];
  } catch (error) {
    console.error('Error in unified search:', error);
    throw error;
  }
}

export async function fetchInventoryPrediction(
  drugName = 'Albuterol Sulfate'
): Promise<InventoryPredictionResponse> {
  try {
    const query = new URLSearchParams({
      drug: drugName,
      patients: '42',
      dosagePerPatient: '6',
    });

    const response = await fetch(`${API_BASE}/api/inventory/predict?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory prediction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory prediction:', error);
    throw error;
  }
}

export async function searchShortages(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search shortages: ${response.statusText}`);
    }

    const payload = await response.json();
    return payload.matches || [];
  } catch (error) {
    console.error('Error searching shortages:', error);
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
