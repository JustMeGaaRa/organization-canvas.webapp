export interface RoleTemplate {
  id: string;
  role: string;
  summary: string;
}

export interface Role extends RoleTemplate {
  assignedPerson?: { id: string; name: string; imageUrl: string };
  status?: "unassigned" | "suggested" | "assigned";
  size?: "small" | "large";
  x: number;
  y: number;
}

export interface Person {
  id: string;
  name: string;
  imageUrl: string;
}

export interface TrackData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  containedCardIds?: string[];
  name?: string;
}

export interface Org {
  id: string;
  name: string;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}
