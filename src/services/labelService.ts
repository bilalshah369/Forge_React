import { setStoredLabels, getStoredLabels } from './storageService';

import { GetAsync_with_token, PostAsync_with_token } from './rest_api_service';
const BASE_URL = import.meta.env.VITE_BASE_URL;

//const BASE_URL = 'your_base_url_here'; // Replace with your actual base URL

interface ApiLabel {
  id: number;
  label_id: string;
  label_name: string;
  label_desc: string;
  default_label_name: string;
  default_label_desc: string;
  is_active: boolean;
  customer_id: number;
  category: string;
}

interface Label {
  display: string;
  placeholder: string;
  dropdown: string;
  plural: string;
}

interface Labels {
  [key: string]: Label;
}

interface ApiResponse {
  status: 'success' | 'error';
  data?: ApiLabel[];
  message?: string;
}

// Mock GetAsync_with_token; replace with your actual implementation
// const GetAsync_with_token = async (uri: string, token: string | null): Promise<any> => {
//   const response = await fetch(uri, {
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });
//   if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//   return response.json();
// };

// // Mock PostAsync_with_token; replace with your actual implementation
// const PostAsync_with_token = async (uri: string, payload: string, token: string | null): Promise<any> => {
//   const response = await fetch(uri, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//     body: payload,
//   });
//   if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//   return response.json();
// };

export const normalizeLabels = (apiLabels: ApiLabel[]): Labels => {
  // Fix TypeError: apiLabels.forEach is not a function
  const labelsArray = Array.isArray(apiLabels) ? apiLabels : [];
  const labels: Labels = {};
  labelsArray.forEach((label) => {
    if (label.is_active && label.label_id) {
      labels[label.label_id] = {
        display: label.label_name || label.default_label_name || 'Unknown',
        placeholder: `Enter ${label.label_name || label.default_label_name || 'Unknown'} Name`,
        dropdown: `Select ${label.label_name || label.default_label_name || 'Unknown'}`,
        plural: `${label.label_name || label.default_label_name || 'Unknown'}s`,
      };
    }
  });
  return labels;
};

export const fetchAndStoreLabels = async (customerId: string, labelId: string = ''): Promise<Labels> => {
  try {
    const uri = `${BASE_URL}/customeradmin/get_custom_labels?label_id=${labelId}`;
    const token = localStorage.getItem('Token');
    const jsonResult: ApiResponse = await GetAsync_with_token(uri, token);
    if (jsonResult.status !== 'success') {
      throw new Error(jsonResult.message || 'Failed to fetch labels');
    }
    const apiLabels: ApiLabel[] = jsonResult.data ?? [];
    console.log('API Response:', apiLabels);
    await setStoredLabels(apiLabels); // Store raw ApiLabel[]
    return normalizeLabels(apiLabels); // Return transformed Labels
  } catch (error) {
    console.error('Error fetching labels:', error);
    await setStoredLabels([]); // Store empty array as fallback
    return {};
  }
};

export const fetchLabelsByCategory = async (categoryCode: string): Promise<ApiLabel[]> => {
  try {
    const uri = `${BASE_URL}/customeradmin/get_custom_labels?category=${categoryCode}`; // Adjust query if needed
    const token = localStorage.getItem('Token');
    const jsonResult: ApiResponse = await GetAsync_with_token(uri, token);
    if (jsonResult.status !== 'success') {
      throw new Error(jsonResult.message || `Failed to fetch labels for ${categoryCode}`);
    }
    const apiLabels: ApiLabel[] = jsonResult.data ?? [];
    console.log('Category Labels Response:', apiLabels);
    return apiLabels;
  } catch (error) {
    console.error(`Error fetching labels for ${categoryCode}:`, error);
    throw error;
  }
};

export const updateLabel = async (
  customerId: string,
  labelId: string,
  updatedLabelData: { label_name: string; is_active: boolean }
): Promise<Labels> => {
  try {
    const uri = `${BASE_URL}/customeradmin/upsert_custom_label`;
    const token = localStorage.getItem('Token');
    const payload = JSON.stringify({
      label_id: labelId,
      label_name: updatedLabelData.label_name,
      is_active: updatedLabelData.is_active,
    });
    const jsonResult: ApiResponse = await PostAsync_with_token(uri, payload, token);
    if (jsonResult.status !== 'success') {
      throw new Error(jsonResult.message || 'Failed to update label');
    }
    // Fetch and store updated labels
    const updatedLabels = await fetchAndStoreLabels(customerId, '');
    
      window.dispatchEvent(new Event('storage'));
    
    return updatedLabels;
  } catch (error) {
    console.error('Error updating label:', error);
    throw new Error(`Failed: ${error}`);
  }
};