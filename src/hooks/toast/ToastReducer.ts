import { State, Action, actionTypes } from "./ToastTypes";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, dispatch: (action: Action) => void) => {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action, dispatch: (action: Action) => void): State => {
  switch (action.type) {
    case "ADD_TOAST": return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "UPDATE_TOAST": return { ...state, toasts: state.toasts.map(t => t.id === action.toast.id ? { ...t, ...action.toast } : t) };
    case "DISMISS_TOAST": 
      const { toastId } = action;
      if (toastId) addToRemoveQueue(toastId, dispatch);
      else state.toasts.forEach(t => addToRemoveQueue(t.id, dispatch));
      return { ...state, toasts: state.toasts.map(t => t.id === toastId || toastId === undefined ? { ...t, open: false } : t) };
    case "REMOVE_TOAST":
      if (action.toastId === undefined) return { ...state, toasts: [] };
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.toastId) };
    default: return state;
  }
};
