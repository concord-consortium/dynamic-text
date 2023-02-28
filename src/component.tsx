import React, {useRef, useState, useEffect, useCallback, useContext} from "react";
import { v4 as uuid } from "uuid";
import { useDynamicTextContext } from "./context";
import { DynamicTextInterface, DynamicTextMessage } from "./types";

interface Props {
  noReadAloud?: boolean;
  context?: DynamicTextInterface; // allows context to optionally be passed as a prop
}

const addDynamicTextStyles = () => {

  const element = document.createElement("style");
  element.setAttribute("type", "text/css");
  element.textContent = `
    .readAloudTextEnabled:hover, .readAloudTextSelected {
      color: black !important;
      background-color: #f8ff00 !important;
      cursor: pointer !important;
    }
  `;
  document.getElementsByTagName("head")[0].appendChild(element);
};
addDynamicTextStyles();

export const DynamicText: React.FC<Props> = ({ noReadAloud, children, context }) => {
  const dynamicText = context || useDynamicTextContext();
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
    dynamicText.registerComponent(componentId, (message: DynamicTextMessage) => {
      switch (message.type) {
        case "readAloudEnabled":
          setEnabled(message.enabled);
          break;
        case "selected":
          setSelected(message.id === componentId);
          break;
      }
    });

    return () => dynamicText.unregisterComponent(componentId);
  }, []);

  // select the component when clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // this will need to change to an api message
    dynamicText.selectComponent(id, {
      readAloud,
      text: (ref.current?.innerText || "").trim(),
    });
  }, [id]);

  const className = [
    readAloud && enabled ? "readAloudTextEnabled" : "",
    readAloud && selected ? "readAloudTextSelected" : ""
  ].join(" ");

  return (
    <div className={className} onClick={handleClick} ref={ref}>{children}</div>
  );
};
