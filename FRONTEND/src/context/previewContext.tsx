import { createContext, useState } from 'react';

export const PreviewContext = createContext<any>(null);


export const PreviewProvider = ({ children }) => {
  const [goToPreview, setGoToPreview] = useState(false);

  return (
    <PreviewContext.Provider value={{ goToPreview, setGoToPreview }}>
      {children}
    </PreviewContext.Provider>
  );
};
