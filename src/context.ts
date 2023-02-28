import { createContext, useContext } from "react";
import { DynamicTextInterface } from "./types";

export const DynamicTextContext = createContext<DynamicTextInterface|null>(null);
DynamicTextContext.displayName = "DynamicTextContext";

export const useDynamicTextContext = () => {
  const currentDynamicTextContext = useContext(DynamicTextContext);

  if (!currentDynamicTextContext) {
    throw new Error(
      "useDynamicTextContext has to be used within <DynamicTextContext.Provider>"
    );
  }

  return currentDynamicTextContext;
};

// This context is used for containers, like report items, that have dynamic text enabled
// components that are but run in a host (like the reports) which don't support dynamic text.
// It provides empty stub functions and it can also be used in tests

export const fakeDynamicTextContext: DynamicTextInterface = {
  registerComponent: () => undefined,
  unregisterComponent: () => undefined,
  selectComponent: () => undefined
};
export const FakeDynamicTextContext = createContext<DynamicTextInterface>(fakeDynamicTextContext);

export const useFakeDynamicTextContext = () => useContext(FakeDynamicTextContext);
