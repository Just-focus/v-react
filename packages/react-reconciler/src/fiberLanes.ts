import { FiberRootNode } from './fiber';

export type Lanes = number;
export type Lane = number;

export const SyncLane: Lane = 0b00000000000000000000000000000001;
export const NoLane: Lane = 0b00000000000000000000000000000000;
export const NoLanes: Lanes = 0b00000000000000000000000000000000;

export function isSubsetOfLanes(set: Lanes, subset: Lane) {
  return (set & subset) === subset;
}

export function mergeLanes(a: Lanes, b: Lanes) {
  return a | b;
}

export function includesSomeLane(set: Lanes, subset: Lanes) {
  return (set & subset) !== NoLane;
}

export function pickArbitraryLane(set: Lanes) {
  return set & ~NoLane;
}

export function getHighestPriorityLane(lanes: Lanes): Lane {
  return lanes & -lanes;
}

export function markRootFinished(root: FiberRootNode, lane: Lane) {
  root.pendingLanes &= ~lane;
}

export function removeLane(set: Lanes, lane: Lane) {
  return set & ~lane;
}

export function requestUpdateLane() {
  return SyncLane;
}
