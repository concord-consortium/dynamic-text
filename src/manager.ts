import { boundaryWordRegExp } from "./regexs";
import { DynamicTextListener, DynamicTextInterface, DynamicTextMessage, SelectComponentOptions, SelectComponentEvent } from "./types";

export interface DynamicTextManagerOptions {
  onEvent: (event: SelectComponentEvent) => void;
}

const params = new URLSearchParams(window.location.search);
let rate = parseFloat(params.get("readAloudRate") || "0.7");
if (isNaN(rate)) {
  rate = 1;
}

type DynamicTextSessionStorage = {
  readAloudEnabled: boolean;
}

const defaultSessionStorage: DynamicTextSessionStorage = {
  readAloudEnabled: false
}

export class DynamicTextManager implements DynamicTextInterface {
  static SessionStorageKey = "dynamicTextSettings";
  private readAloudEnabled = false;
  private selectedComponentId: string | null = null;
  private components: Record<string, DynamicTextListener> = {};
  private onEvent: (event: SelectComponentEvent) => void;
  private sessionStorage: DynamicTextSessionStorage;
  private currentUtterance: SpeechSynthesisUtterance|null = null;

  constructor(options: DynamicTextManagerOptions) {
    this.onEvent = options.onEvent;

    this.sessionStorage = defaultSessionStorage;
    try {
      this.sessionStorage = JSON.parse(window.sessionStorage.getItem(DynamicTextManager.SessionStorageKey) || "") || defaultSessionStorage;
    } catch (e) {
      // no-op
    }
    this.readAloudEnabled = this.isReadAloudAvailable && this.sessionStorage.readAloudEnabled;
  }

  public get isReadAloudAvailable() {
    return !!window.speechSynthesis;
  }

  public get isReadAloudEnabled() {
    return this.readAloudEnabled;
  }

  public enableReadAloud(options: {enabled: boolean, saveSetting: boolean}) {
    const {enabled, saveSetting} = options;
    this.readAloudEnabled = enabled;
    this.selectedComponentId = null;
    this.stopSpeaking();
    this.emit({ type: "readAloudEnabled", enabled });
    this.emit({ type: "selected", id: this.selectedComponentId });

    if (saveSetting) {
      try {
        this.sessionStorage.readAloudEnabled = enabled;
        window.sessionStorage.setItem(DynamicTextManager.SessionStorageKey, JSON.stringify(this.sessionStorage));
      } catch (e) {
        // no-op
      }
    }
  }

  public registerComponent(id: string, listener: DynamicTextListener) {
    this.components[id] = listener;
    listener({ type: "readAloudEnabled", enabled: this.readAloudEnabled });
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

    // nothing to do if not enabled
    if (!this.readAloudEnabled) {
      return;
    }

    if (this.selectedComponentId === id) {
      if (this.currentUtterance) {
        this.onEvent({type: "readAloudCanceled", text: this.currentUtterance.text, extraLoggingInfo});
      }
      this.selectedComponentId = null;
    } else {
      this.selectedComponentId = id;
    }

    if (readAloud) {
      this.stopSpeaking();
    }
    this.emit({ type: "selected", id: this.selectedComponentId });

    if (readAloud && this.selectedComponentId && (text.length > 0)) {
      const wordIndexes: Record<string,number> = {};

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.rate = rate;
      this.currentUtterance.addEventListener("boundary", (e) => {
        if (this.selectedComponentId && e.name === "word") {
          // extract the word found at the spoken index
          const match = text.substring(e.charIndex).trim().match(boundaryWordRegExp);
          if (match) {
            const word = match[0];
            wordIndexes[word] = wordIndexes[word] ?? 0;
            this.emit({type: "wordUttered", id: this.selectedComponentId, options: {word, wordIndex: wordIndexes[word]}});
            wordIndexes[word]++;
          }
        }
      });
      this.currentUtterance.addEventListener("end", () => {
        // mark that this utterance is complete
        this.currentUtterance = null;

        // if this is still the currently selected component deselect it
        if (this.selectedComponentId === id) {
          this.onEvent({type: "readAloudComplete", text, extraLoggingInfo});
          this.selectComponent(null);
        }
      });
      this.emit({type: "speechStarting", id: this.selectedComponentId});
      window.speechSynthesis.speak(this.currentUtterance);
      this.onEvent({type: "readAloud", text, extraLoggingInfo});
    }
  }

  private stopSpeaking() {
    window.speechSynthesis?.cancel();
  }

  private emit(message: DynamicTextMessage) {
    Object.values(this.components).forEach(listener => listener(message));
  }
}

