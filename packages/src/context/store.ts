import { type OverlayControllerComponent } from './provider';
import { type OverlayReducerAction, overlayReducer } from './reducer';

type OverlayId = string;
export type OverlayItem = {
  id: OverlayId;
  isOpen: boolean;
  controller: OverlayControllerComponent;
};
export type OverlayData = {
  current: OverlayId | null;
  overlayOrderList: OverlayId[];
  overlayData: Record<OverlayId, OverlayItem>;
};

let overlays: OverlayData = {
  current: null,
  overlayOrderList: [],
  overlayData: {},
};
let listeners: Array<() => void> = [];

function emitChangeListener() {
  for (const listener of listeners) {
    listener();
  }
}

export function dispatchOverlay(action: OverlayReducerAction) {
  overlays = overlayReducer(overlays, action);
  emitChangeListener();

  if (action.type === 'CLOSE') {
    const timer = setTimeout(() => {
      dispatchOverlay({ type: 'REMOVE', overlayId: action.overlayId });
    }, action.duration ?? 300);

    return () => clearTimeout(timer);
  }

  if (action.type === 'CLOSE_ALL') {
    const timer = setTimeout(() => {
      dispatchOverlay({ type: 'REMOVE_ALL' });
    }, action.duration ?? 300);

    return () => clearTimeout(timer);
  }
}

/**
 * @description for useSyncExternalStorage
 */
export const registerOverlaysStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return overlays;
  },
};
