export const DynamicTextCustomMessageType = "dynamicText";
export type SelectComponentEvent =
  {type: "readAloud", text: string} |
  {type: "readAloudComplete", text: string} |
  {type: "readAloudCanceled", text: string}

export type SelectComponentOptions = {
  text: string;
  readAloud: boolean;
  onEvent?: (event: SelectComponentEvent) => void;
}

export type DynamicTextMessage =
  { type: "selected", id: string | null } |
  { type: "enabled", enabled: boolean } |
  { type: "register", id: string } |
  { type: "unregister", id: string } |
  { type: "select", id: string|null, options?: SelectComponentOptions };

export type DynamicTextListener = (message: DynamicTextMessage) => void;

export interface DynamicTextInterface {
  registerComponent(id: string, listener: DynamicTextListener): void;
  unregisterComponent(id: string): void;
  selectComponent(id: string | null, options?: SelectComponentOptions): void;
}
