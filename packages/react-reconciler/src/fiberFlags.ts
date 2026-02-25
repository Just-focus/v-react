export type Flags = number;

export const NoFlags = 0b00000000000000000000000000000000;
export const Placement = 0b00000000000000000000000000000010;
export const Update = 0b00000000000000000000000000000100;
export const Deletion = 0b00000000000000000000000000001000;
export const ChildDeletion = 0b0000000000000000000000000001000;
export const PassiveEffect = 0b0000000000000000000000000010000;

export const MutationMask = Placement | Update | Deletion | ChildDeletion;
export const PassiveMask = PassiveEffect | ChildDeletion;
