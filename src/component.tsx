import React, {useRef, useState, useEffect, useCallback} from "react";
import { v4 as uuid } from "uuid";
import { ReadAloudManager } from "./manager";
import { ReadAloudMessage } from "./types";

const addReadAloudTextStyles = () => {

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
addReadAloudTextStyles();

const readAloudManager = new ReadAloudManager()

export const ReadAloudText: React.FC = ({ children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [id, setId] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState(false);

  // register the component onmount and unregister when unmounted
  useEffect(() => {
    const componentId = uuid();
    setId(componentId);

    // this will need to change to an api message
    readAloudManager.registerComponent(componentId, (message: ReadAloudMessage) => {
      switch (message.type) {
        case "enabled":
          setEnabled(message.enabled);
          break;
        case "selected":
          setSelected(message.id === componentId);
          break;
      }
    });

    return () => readAloudManager.unregisterComponent(componentId);
  }, []);

  // select the component when clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // this will need to change to an api message
    readAloudManager.selectComponent(id, {
      text: (ref.current?.innerText || "").trim()
    });
  }, [id]);

  const className = [
    enabled ? "readAloudTextEnabled" : "",
    selected ? "readAloudTextSelected" : ""
  ].join(" ");

  return (
    <div className={className} onClick={handleClick} ref={ref}>{children}</div>
  );
};
