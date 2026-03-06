import * as React from "react";
import { State, Action, ToasterToast, actionTypes } from "./ToastTypes";
import { reducer } from "./ToastReducer";

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action, dispatch);
  listeners.forEach(l => l(memoryState));
}

let count = 0;
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return count.toString(); }

export function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();
  const update = (p: ToasterToast) => dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...p, id } });
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });
  dispatch({ type: actionTypes.ADD_TOAST, toast: { ...props, id, open: true, onOpenChange: (o) => { if (!o) dismiss(); } } });
  return { id, dismiss, update };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const idx = listeners.indexOf(setState); if (idx > -1) listeners.splice(idx, 1); };
  }, [state]);
  return { ...state, toast, dismiss: (id?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }) };
}
