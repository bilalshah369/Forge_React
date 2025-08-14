/* eslint-disable prefer-const */


const LABELS_KEY = 'labelData';

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

export const setStoredLabels = async (labels: ApiLabel[]): Promise<void> => {
  try {
    const value = JSON.stringify(labels);
    
      localStorage.setItem(LABELS_KEY, value);
    
  } catch (error) {
    console.error('Error storing labels:', error);
  }
};

export const getStoredLabels = async (): Promise<ApiLabel[]> => {
  try {
    let storedLabels: string | null;
    storedLabels = localStorage.getItem(LABELS_KEY);
      return storedLabels ? JSON.parse(storedLabels) : [];
  } catch (error) {
    console.error('Error parsing stored labels:', error);
    return [];
  }
};