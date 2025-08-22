import {
  fetchAndStoreLabels,
  normalizeLabels,
  updateLabel,
} from "@/services/labelService";
import { getStoredLabels } from "@/services/storageService";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Label {
  display: string;
  placeholder: string;
  dropdown: string;
  plural: string;
}

interface Labels {
  [key: string]: Label;
}

interface LabelContextType {
  labels: Labels;
  updateLabel: (
    labelId: string,
    updatedLabelData: {
      label_name: string;
      label_desc: string;
      is_active: boolean;
    }
  ) => Promise<void>;
}

interface LabelProviderProps {
  customerId: string;
  labelId?: string;
  children: React.ReactNode;
}

const LabelContext = createContext<LabelContextType | undefined>(undefined);

export const LabelProvider: React.FC<LabelProviderProps> = ({
  customerId,
  labelId = "",
  children,
}) => {
  const [labels, setLabels] = useState<Labels>({});

  useEffect(() => {
    const initializeLabels = async () => {
      const storedLabels = await getStoredLabels(); // Get ApiLabel[]
      setLabels(normalizeLabels(storedLabels)); // Transform to Labels
      const fetchedLabels = await fetchAndStoreLabels(customerId, labelId);
      setLabels(fetchedLabels); // Already transformed
    };
    initializeLabels();
  }, [customerId, labelId]);

  const handleUpdateLabel = async (
    labelId: string,
    updatedLabelData: { label_name: string; is_active: boolean }
  ) => {
    const updatedLabels = await updateLabel(
      customerId,
      labelId,
      updatedLabelData
    );
    setLabels(updatedLabels); // Already transformed
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "customer_labels") {
        const newLabels = e.newValue ? JSON.parse(e.newValue) : [];
        setLabels(normalizeLabels(newLabels)); // Transform to Labels
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <LabelContext.Provider value={{ labels, updateLabel: handleUpdateLabel }}>
      {children}
    </LabelContext.Provider>
  );
};

export const useLabels = (): LabelContextType => {
  const context = useContext(LabelContext);
  if (!context) {
    throw new Error("useLabels must be used within a LabelProvider");
  }
  return context;
};
