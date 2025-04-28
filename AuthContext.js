//Use user email for authentication.
import React, { createContext, useContext, useState } from 'react';

// Create AuthContext for authentication
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
    const [userEmail, setUserEmail] = useState(null);

    return (
        <AuthContext.Provider value={{ userEmail, setUserEmail }}>
            {children}
        </AuthContext.Provider>
    ); // Provide userEmail and setUserEmail to children components
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context; // Return the context value
};