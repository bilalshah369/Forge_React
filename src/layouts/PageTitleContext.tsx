/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const TitleContext = createContext({
  title: "",
  setTitle: (title: string) => {},
});

export const TitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState("");

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => useContext(TitleContext);
