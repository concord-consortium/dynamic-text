import { useEffect, useState } from "react";
import {getClient, ICustomMessage, sendCustomMessage} from "@concord-consortium/lara-interactive-api";

import { DynamicTextCustomMessageType, DynamicTextInterface, DynamicTextListener, DynamicTextMessage, SelectComponentOptions } from "./types";

export class DynamicTextProxy implements DynamicTextInterface {
  private listener: DynamicTextListener|null = null;

  constructor() {
    getClient().addListener("customMessage", (message: ICustomMessage) => {
      if (message.type === DynamicTextCustomMessageType) {
        this.listener?.(message.content as DynamicTextMessage);
      }
    });
  }

  public registerComponent(id: string, listener: DynamicTextListener) {
    this.listener = listener;
    this.sendCustomMessage({type: "register", id});
  }

  public unregisterComponent(id: string) {
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

export const useDynamicTextProxy = () => {
  const [proxy, setProxy] = useState<DynamicTextProxy>();

  useEffect(() => {
    if (!proxy) {
      setProxy(new DynamicTextProxy())
    }
  }, [proxy]);

  return proxy as DynamicTextProxy;
}
