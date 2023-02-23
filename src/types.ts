export type DynamicTextMessage =
  { type: "selected", id: string | null } |
  { type: "enabled", enabled: boolean };

export type DynamicTextListener = (message: DynamicTextMessage) => void;