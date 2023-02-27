import {getClient, ICustomMessage, sendCustomMessage} from "@concord-consortium/lara-interactive-api";

import { DynamicTextCustomMessageType, DynamicTextInterface, DynamicTextListener, DynamicTextMessage, SelectComponentOptions } from "./types";

export class DynamicTextProxy implements DynamicTextInterface {
  private listeners: Record<string,DynamicTextListener> = {};

  constructor() {
    getClient().addListener("customMessage", (message: ICustomMessage) => {
      if (message.type === DynamicTextCustomMessageType) {
        Object.values(this.listeners).forEach(listener => {
          listener(message.content as DynamicTextMessage);
        });
      }
    });
  }

  public registerComponent(id: string, listener: DynamicTextListener) {
    this.listeners[id] = listener;
    this.sendCustomMessage({type: "register", id});
  }

  public unregisterComponent(id: string) {
    delete this.listeners[id];
    this.sendCustomMessage({type: "unregister", id});
  }

  public selectComponent(id: string | null, options?: SelectComponentOptions) {
    this.sendCustomMessage({type: "select", id, options});
  }

  private sendCustomMessage(message: DynamicTextMessage) {
    const customMessage: ICustomMessage = {
      type: DynamicTextCustomMessageType,
      content: message
    };
    sendCustomMessage(customMessage);
  }
}

// hook to return singleton instance - this needs to exist on initial render
// so useEffect() can't be used
const proxy = new DynamicTextProxy();
export const useDynamicTextProxy = () => proxy;
