export const DynamicTextCustomMessageType = "dynamicText";

export type ExtraLoggingInfo = Record<string,any>;

export type SelectComponentEvent =
  {type: "readAloud", text: string, extraLoggingInfo?: ExtraLoggingInfo} |
  {type: "readAloudComplete", text: string, extraLoggingInfo?: ExtraLoggingInfo} |
  {type: "readAloudCanceled", text: string, extraLoggingInfo?: ExtraLoggingInfo}

export type SelectComponentOptions = {
  text: string;
  readAloud: boolean;
  extraLoggingInfo?: ExtraLoggingInfo;
}

export type WordUtteredOptions = {
  word: string;
  wordIndex: number;
}

export type WordInstance = [HTMLElement, number];
export type WordInstanceMap = Record<string, WordInstance[]|undefined>;

export type ParsedWord = {word: string; index: number};

export type DynamicTextMessage =
  { type: "selected", id: string | null } |
  { type: "readAloudEnabled", enabled: boolean } |
  { type: "register", id: string } |
  { type: "unregister", id: string } |
  { type: "select", id: string|null, options?: SelectComponentOptions } |
  { type: "speechStarting", id: string } |
  { type: "wordUttered", id: string, options: WordUtteredOptions }
  ;

export type DynamicTextListener = (message: DynamicTextMessage) => void;

export interface DynamicTextInterface {
  registerComponent(id: string, listener: DynamicTextListener): void;
  unregisterComponent(id: string): void;
  selectComponent(id: string | null, options?: SelectComponentOptions): void;
}
