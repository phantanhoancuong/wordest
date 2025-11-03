import { Toast } from "./toast";

export interface UseToastsReturn {
  toastList: Array<Toast>;
  addToast: (message: string) => void;
  removeToast: (id: number) => void;
}
