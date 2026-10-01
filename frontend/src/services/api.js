import API_URL from '../config/api';

/**
 * Parses HTTP responses safely and throws descriptive error objects
 */
async function parseResponse(response) {
  let data = null;
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = (data && (data.error || data.message)) || '';
    if (!errorMessage) {
      if (response.status === 400) {
        errorMessage = 'Invalid request data. Please check all fields.';
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized. Invalid credentials or expired session.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission.';
      } else if (response.status === 404) {
        errorMessage = 'Requested endpoint or record not found.';
      } else if (response.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        errorMessage = 'Backend service is unavailable. Please verify the server is running.';
      } else {
        errorMessage = `Request failed with status code ${response.status}.`;
      }
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Converts generic browser fetch exceptions (network down, CORS block, connection refused)
 * into helpful user-facing error messages instead of plain "Failed to fetch".
 */
function handleFetchError(error) {
  if (error instanceof TypeError && /failed to fetch|networkerror|load failed/i.test(error.message)) {
    const enhancedError = new Error(
      'Unable to connect to the server. Please verify the backend service is running and CORS is configured correctly.'
    );
    enhancedError.original = error;
    throw enhancedError;
  }
  throw error;
}

/**
 * Submit a grievance (supports file attachment via FormData)
 */
export async function submitGrievance(formData) {
  try {
    const response = await fetch(`${API_URL}/api/grievance`, {
      method: 'POST',
      body: formData,
      // Note: Do NOT set Content-Type header when body is FormData;
      // browser automatically sets multipart/form-data with boundary.
    });
    return await parseResponse(response);
  } catch (err) {
    handleFetchError(err);
  }
}

/**
 * Admin Login
 */
export async function adminLogin(username, password) {
  try {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return await parseResponse(response);
  } catch (err) {
    handleFetchError(err);
  }
}

/**
 * Fetch all grievances (optionally filtered by status: Pending, Resolved, Rejected)
 */
export async function getGrievances(status) {
  try {
    const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    const response = await fetch(`${API_URL}/api/grievances${query}`);
    return await parseResponse(response);
  } catch (err) {
    handleFetchError(err);
  }
}

/**
 * Fetch a single grievance by GID
 */
export async function getGrievanceByGid(gid) {
  try {
    const response = await fetch(`${API_URL}/api/grievance/${encodeURIComponent(gid)}`);
    return await parseResponse(response);
  } catch (err) {
    handleFetchError(err);
  }
}

/**
 * Update grievance status (Pending, Resolved, Rejected)
 */
export async function updateGrievanceStatus(gid, status) {
  try {
    const response = await fetch(`${API_URL}/api/grievance/${encodeURIComponent(gid)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return await parseResponse(response);
  } catch (err) {
    handleFetchError(err);
  }
}

/**
 * Generate export CSV URL
 */
export function getExportUrl(status) {
  const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
  return `${API_URL}/api/grievances/export${query}`;
}

/**
 * Generate full URL to an uploaded file
 */
export function getUploadUrl(filename) {
  if (!filename) return '';
  return `${API_URL}/uploads/${encodeURIComponent(filename)}`;
}
