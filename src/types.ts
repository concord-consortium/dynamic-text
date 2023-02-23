export type ReadAloudMessage =
  { type: "selected", id: string | null } |
  { type: "enabled", enabled: boolean };

export type ReadAloudListener = (message: ReadAloudMessage) => void;