
import React, {
  createContext,
  useContext,
  useState,
} from 'react';

export const CaptainDataContext = createContext(null);

export const useCaptain = () => {
  const context = useContext(CaptainDataContext);

  if (!context) {
    throw new Error(
      'useCaptain must be used within CaptainContext'
    );
  }

  return context;
};

const initialCaptain = {
  email: '',
  fullName: {
    firstName: '',
    lastName: '',
  },
  vehicle: {
    color: '',
    plate: '',
    capacity: 0,
    model: '',
    vehicleType: '',
  },
};

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(initialCaptain);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetCaptain = () => {
    setCaptain(initialCaptain);
    setIsLoading(false);
    setError(null);
  };

  return (
    <CaptainDataContext.Provider
      value={{
        captain,
        setCaptain,
        resetCaptain,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
