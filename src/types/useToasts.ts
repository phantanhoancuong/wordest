import { Toast } from "@/types/toast.types";

export interface UseToastsReturn {
  toastList: Array<Toast>;
  addToast: (message: string) => void;
  removeToast: (id: number) => void;
}
