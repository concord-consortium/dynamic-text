import { createContext, useContext } from "react";
import { DynamicTextInterface } from "./types";

export const DynamicTextContext = createContext<DynamicTextInterface|null>(null);
DynamicTextContext.displayName = "DynamicTextContext";

export const useDynamicTextContext = () => {
  const currentDynamicTextContext = useContext(DynamicTextContext);

  /*

  remove to see if tests are easier

  if (!currentDynamicTextContext) {
    throw new Error(
      "useDynamicTextContext has to be used within <DynamicTextContext.Provider>"
    );
  }
  */

  return currentDynamicTextContext!;
};