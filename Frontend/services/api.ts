export const BASE_URL = '#'; // your ip 

export interface ApiResponse {
  ok: boolean;
  message?: string;
  data?: any;
  suggestions?: string;
  blob?: Blob;
}

/**
 * Generic API POST request with timeout
 */
export async function sendRequest(endpoint: string, data: any): Promise<ApiResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json();
    return json;
  } catch (err: any) {
    console.error('Request failed:', err);
    if (err.name === 'AbortError') {
      return { ok: false, message: 'Request timeout - please try again' };
    }
    return { ok: false, message: 'Network or server error' };
  }
}

/**
 * Generate PDF request to backend servlet
 */
export async function generatePdf(endpoint: string, data: any): Promise<ApiResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      return { ok: false, message: json.message || 'Failed to generate PDF' };
    }

    const blob = await response.blob();
    return { ok: true, blob };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    if (error.name === 'AbortError') {
      return { ok: false, message: 'Request timeout - please try again' };
    }
    return { ok: false, message: 'Error generating PDF' };
  }
}
