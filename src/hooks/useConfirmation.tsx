import { ConfirmationBox } from "@/components/ui/delete-confirmation";
import { useState } from "react";

type ConfirmOptions = {
  itemName: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function useConfirmationAlert() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
  };

  const handleConfirm = () => {
    options?.onConfirm();
    setOptions(null);
  };

  const handleCancel = () => {
    options?.onCancel?.();
    setOptions(null);
  };

  const ConfirmationAlert = options ? (
    <ConfirmationBox
      isOpen={!!options}
      itemName={options.itemName}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, ConfirmationAlert };
}
