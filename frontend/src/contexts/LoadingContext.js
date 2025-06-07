import React, { createContext, useState, useContext, useCallback } from "react";

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading...");

  const startLoading = useCallback(
    (message = "Loading...", initialPercent = 0) => {
      setLoadingText(message);
      setProgressPercent(initialPercent);
      setIsLoading(true);
    },
    []
  );

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgressPercent(0);
    setLoadingText("Loading..."); // Reset to default
  }, []);

  const updateProgress = useCallback((percent) => {
    setProgressPercent(percent);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        progressPercent,
        loadingText,
        startLoading,
        stopLoading,
        updateProgress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
