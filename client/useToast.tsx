import React, { useEffect, useState } from "react";
import { Toast } from "./designSystem";

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    timeoutId: ReturnType<typeof setTimeout>;
    type: string;
  }>({ message: "", timeoutId: null, type: "" });

  useEffect(() => {
    if (toast.message.length === 0) {
      return;
    }

    if (toast.timeoutId !== null) {
      console.log("clearing timeout id", toast.timeoutId);
      clearTimeout(toast.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setToast({ message: "", timeoutId: null, type: "" });
    }, 3000);

    return () => {
      console.log("clearing timeout id", timeoutId);
      clearTimeout(timeoutId);
    };
  }, [toast]);

  return {
    toast: toast.message !== "" && (
      <Toast message={toast.message} type={toast.type} />
    ),
    setToast: (t: { message: string; type: string }) =>
      setToast({ ...toast, message: t.message, type: t.type }),
  };
}
