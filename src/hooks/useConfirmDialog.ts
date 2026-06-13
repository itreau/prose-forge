import { useState, useCallback } from "react";

interface ConfirmState {
  open: boolean;
  message: string;
  onConfirm: (() => void) | null;
}

const initialState: ConfirmState = { open: false, message: "", onConfirm: null };

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState>(initialState);

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        message,
        onConfirm: () => {
          setState(initialState);
          resolve(true);
        },
      });
    });
  }, []);

  const cancel = useCallback(() => {
    setState(initialState);
  }, []);

  return { state, confirm, cancel };
}