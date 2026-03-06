import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

export type Action =
  | { type: typeof actionTypes.ADD_TOAST; toast: ToasterToast; }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: Partial<ToasterToast>; }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId?: ToasterToast["id"]; }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId?: ToasterToast["id"]; };

export interface State { toasts: ToasterToast[]; }
