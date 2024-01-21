import React, {useRef, useState, useEffect, useCallback} from "react";
import { v4 as uuid } from "uuid";
import { useDynamicTextContext } from "./context";
import { DynamicTextInterface, DynamicTextMessage, WordInstanceMap, WordUtteredOptions } from "./types";
import { findWords } from "./word-parser";

interface Props {
  noReadAloud?: boolean;
  inline?: boolean;
  context?: DynamicTextInterface; // allows context to optionally be passed as a prop
}

const addDynamicTextStyles = () => {

  const element = document.createElement("style");
  element.setAttribute("type", "text/css");
  element.dataset.addedBy = "@concord-consortium/dynamic-text"

  // NOTE: the highlight pseudo-class rule to be its own rule as some browsers don't support highlighting and can't process it
  element.textContent = `
    /* this was dynamically added by the @concord-consortium/dynamic-text package */

    .readAloudTextEnabled:hover, .readAloudTextSelected {
      color: black !important;
      background-color: #f8ff00 !important;
      cursor: pointer !important;
    }
    ::highlight(readAloudWordHighlight) {
      color: black !important;
      background-color: #f8ff00 !important;
    }
  `;

  document.getElementsByTagName("head")[0].appendChild(element);
};
addDynamicTextStyles();

// Some browsers don't support highlighting and it is defined in a later ES version than es2018
// which we have set in the tsconfig so we need to cast the window and CSS objects to any in order to reference it
let highlight: any = undefined;
const Highlight = (window as any).Highlight;
const highlights = (CSS as any).highlights;
if (Highlight && highlights) {
  highlight = new Highlight();
  highlights.set("readAloudWordHighlight", highlight);
}

export const DynamicText: React.FC<Props> = ({ noReadAloud, inline, children, context }) => {
  const dynamicText = context || useDynamicTextContext();
  const readAloud = !noReadAloud;
  const ref = useRef<HTMLDivElement | null>(null);
  const [id, setId] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState(false);
  const [highlightWord, setHighlightWord] = useState<WordUtteredOptions|undefined>(undefined);
  const wordInstanceMap = useRef<WordInstanceMap>({});

  // depth-first walk of the DOM to gather word instances
  const walkDOMToGatherWords = (el: HTMLElement) => {
    if (el.nodeType === Node.TEXT_NODE) {
      const words = findWords(el.textContent || "")
      for (const {word, index} of words) {
        wordInstanceMap.current[word] = wordInstanceMap.current[word] ?? [];
        wordInstanceMap.current[word]?.push([el, index])
      }
    } else if (el.hasChildNodes()) {
      el.childNodes.forEach(child => walkDOMToGatherWords(child as HTMLElement));
    }
  }

  // register the component onmount and unregister when unmounted
  useEffect(() => {
    const componentId = uuid();
    setId(componentId);

    // this will need to change to an api message
    dynamicText.registerComponent(componentId, (message: DynamicTextMessage) => {
      // clear highlighting at the start on all messages
      setHighlightWord(undefined);

      switch (message.type) {
        case "readAloudEnabled":
          setEnabled(message.enabled);
          break;
        case "selected":
          setSelected(message.id === componentId);
          break;
        case "speechStarting":
          if (message.id === componentId) {
            wordInstanceMap.current = {};
            if (ref.current) {
              walkDOMToGatherWords(ref.current);
            }
          }
          break;
        case "wordUttered":
          if (message.id === componentId && highlight) {
            setHighlightWord(message.options);
          }
          break;
      }
    });

    return () => dynamicText.unregisterComponent(componentId);
  }, []);

  // highlight the utterance
  useEffect(() => {
    // some browsers don't support highlighting
    if (!highlight) {
      return;
    }

    highlight.clear();

    if (highlightWord) {
      const {word, wordIndex} = highlightWord;
      const wordInstance = wordInstanceMap.current[word]?.[wordIndex];
      if (wordInstance) {
        const range = new Range();
        const [el, index] = wordInstance;
        range.setStart(el, index);
        range.setEnd(el, index + word.length);
        highlight.add(range);
      }
    }
  }, [highlightWord]);

  // select the component when clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // ignore clicks on links within dynamic text areas and glossary words
    const target = e.target as HTMLElement|undefined;
    if ((target?.tagName === "A") || target?.className.includes("GlossaryWord")) {
      return;
    }

    dynamicText.selectComponent(id, { readAloud, text: (ref.current?.innerText || "").trim() });
  }, [id]);

  // highlighting is active when it is available and a word is being uttered
  const highlighting = !!highlight && !!highlightWord;

  const className = [
    readAloud && enabled  && !highlighting ? "readAloudTextEnabled" : "",
    readAloud && selected && !highlighting ? "readAloudTextSelected" : ""
  ].join(" ");

  if (inline) {
    return (
      <span className={className} onClick={handleClick} ref={ref}>{children}</span>
    );
  }

  return (
    <div className={className} onClick={handleClick} ref={ref}>{children}</div>
  );
};
