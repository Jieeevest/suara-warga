import { EventEmitter } from "node:events";

declare global {
  // eslint-disable-next-line no-var
  var __suraWargaEvents: EventEmitter | undefined;
}

function ensureEmitter() {
  const emitter = global.__suraWargaEvents ?? new EventEmitter();
  emitter.setMaxListeners(50);
  global.__suraWargaEvents = emitter;
  return emitter;
}

export const voteEvents = ensureEmitter();
export const VOTE_CAST_EVENT = "vote-cast";

export interface VoteCastNotification {
  residentName: string;
  castAt: string;
}

export function emitVoteCast(payload: VoteCastNotification) {
  voteEvents.emit(VOTE_CAST_EVENT, payload);
}
