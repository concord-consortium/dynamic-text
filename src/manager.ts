import { ReadAloudListener, ReadAloudMessage } from "./types";

const params = new URLSearchParams(window.location.search);
let readAloudRate = parseFloat(params.get("readAloudRate") || "1");
if (isNaN(readAloudRate)) {
  readAloudRate = 1;
}

export class ReadAloudManager {
  static SessionStorageKey = "readAloud";
  private enabled = false;
  private selectedComponentId: string | null = null;
  private components: Record<string, ReadAloudListener> = {};

  constructor() {
    let enabled = "false";
    try {
      enabled = window.sessionStorage.getItem(ReadAloudManager.SessionStorageKey) || "false";
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
      window.sessionStorage.setItem(ReadAloudManager.SessionStorageKey, `${enabled}`);
    } catch (e) {
      // no-op
    }
  }

  public registerComponent(id: string, listener: ReadAloudListener) {
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

  public selectComponent(id: string | null, options?: {text: string}) {
    const text = options?.text || "";

    if (this.enabled) {
      if (this.selectedComponentId === id) {
        this.selectedComponentId = null;
      } else {
        this.selectedComponentId = id;
      }

      this.stopSpeaking();
      this.emit({ type: "selected", id: this.selectedComponentId });

      if (this.selectedComponentId && (text.length > 0)) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = readAloudRate;
        utterance.addEventListener("end", () => {
          // if this is still the currently selected component deselect it
          if (this.selectedComponentId === id) {
            this.selectComponent(null);
          }
        });
        window.speechSynthesis.speak(utterance);
      }
    }
  }

  private stopSpeaking() {
    window.speechSynthesis?.cancel();
  }

  private emit(message: ReadAloudMessage) {
    Object.values(this.components).forEach(listener => listener(message));
  }
}
