import { DynamicTextListener, DynamicTextInterface, DynamicTextMessage, SelectComponentOptions, SelectComponentEvent } from "./types";

export interface DynamicTextManagerOptions {
  onEvent: (event: SelectComponentEvent) => void;
}

const params = new URLSearchParams(window.location.search);
let rate = parseFloat(params.get("readAloudRate") || "1");
if (isNaN(rate)) {
  rate = 1;
}

export class DynamicTextManager implements DynamicTextInterface {
  static SessionStorageKey = "readAloud";
  private enabled = false;
  private selectedComponentId: string | null = null;
  private selectedComponentText: string | null = null;
  private components: Record<string, DynamicTextListener> = {};
  private onEvent: (event: SelectComponentEvent) => void;

  constructor(options: DynamicTextManagerOptions) {
    this.onEvent = options.onEvent;
    let enabled = "false";
    try {
      enabled = window.sessionStorage.getItem(DynamicTextManager.SessionStorageKey) || "false";
    } catch (e) {
      // no-op
    }
    this.enabled = this.isAvailable && enabled === "true";
  }

  public get isAvailable() {
    return !!window.speechSynthesis;
  }

  public get isEnabled() {
    return this.enabled;
  }

  public enable(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.selectedComponentId = null;
    }
    this.stopSpeaking();
    this.emit({ type: "enabled", enabled });
    this.emit({ type: "selected", id: this.selectedComponentId });

    try {
      window.sessionStorage.setItem(DynamicTextManager.SessionStorageKey, `${enabled}`);
    } catch (e) {
      // no-op
    }
  }

  public registerComponent(id: string, listener: DynamicTextListener) {
    this.components[id] = listener;
    listener({ type: "enabled", enabled: this.enabled });
  }

  public unregisterComponent(id: string) {
    delete this.components[id];
    if (this.selectedComponentId === id) {
      this.selectedComponentId = null;
      this.stopSpeaking();
    }
  }

  public selectComponent(id: string | null, options?: SelectComponentOptions) {
    const text = options?.text || "";
    const readAloud = options?.readAloud || false;
    const extraLoggingInfo = options?.extraLoggingInfo;

    if (this.enabled) {
      if (this.selectedComponentId === id) {
        if (readAloud && this.selectedComponentText) {
          this.onEvent({type: "readAloudCanceled", text: this.selectedComponentText, extraLoggingInfo});
        }
        this.selectedComponentId = null;
        this.selectedComponentText = null;
      } else {
        this.selectedComponentId = id;
        this.selectedComponentText = text;
      }

      if (readAloud) {
        this.stopSpeaking();
      }
      this.emit({ type: "selected", id: this.selectedComponentId });

      if (readAloud && this.selectedComponentId && (text.length > 0)) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.addEventListener("end", () => {
          // if this is still the currently selected component deselect it
          if (this.selectedComponentId === id) {
            this.onEvent({type: "readAloudComplete", text, extraLoggingInfo});
            this.selectComponent(null);
          }
        });
        window.speechSynthesis.speak(utterance);
        this.onEvent({type: "readAloud", text, extraLoggingInfo});
      }
    }
  }

  private stopSpeaking() {
    window.speechSynthesis?.cancel();
  }

  private emit(message: DynamicTextMessage) {
    Object.values(this.components).forEach(listener => listener(message));
  }
}

