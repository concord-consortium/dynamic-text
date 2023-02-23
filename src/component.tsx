import React, {useRef, useState, useEffect, useCallback} from "react";
import { v4 as uuid } from "uuid";
import { DyanmicTextManager } from "./manager";
import { DynamicTextMessage } from "./types";

interface Props {
  noReadAloud?: boolean;
}

const addDynamicTextStyles = () => {

  const element = document.createElement("style");
  element.setAttribute("type", "text/css");
  element.textContent = `
    .readAloudTextEnabled:hover, .readAloudTextSelected {
      color: black;
      background-color: #f8ff00;
      cursor: pointer;
    }
  `;
  document.getElementsByTagName("head")[0].appendChild(element);
};
addDynamicTextStyles();

const dynamicTextManager = new DyanmicTextManager()

export const DynamicText: React.FC<Props> = ({ noReadAloud, children }) => {
  const readAloud = !noReadAloud;
  const ref = useRef<HTMLDivElement | null>(null);
  const [id, setId] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState(false);

  // register the component onmount and unregister when unmounted
  useEffect(() => {
    const componentId = uuid();
    setId(componentId);

    // this will need to change to an api message
    dynamicTextManager.registerComponent(componentId, (message: DynamicTextMessage) => {
      switch (message.type) {
        case "enabled":
          setEnabled(message.enabled);
          break;
        case "selected":
          setSelected(message.id === componentId);
          break;
      }
    });

    return () => dynamicTextManager.unregisterComponent(componentId);
  }, []);

  // select the component when clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // this will need to change to an api message
    dynamicTextManager.selectComponent(id, {
      readAloud,
      text: (ref.current?.innerText || "").trim(),
    });
  }, [id]);

  const className = [
    readAloud && enabled ? "readAloudTextEnabled" : "",
    readAloud && selected ? "readAloudTextSelected" : ""
  ].join(" ");

  console.log({className, readAloud, enabled, selected});

  return (
    <div className={className} onClick={handleClick} ref={ref}>{children}</div>
  );
};
