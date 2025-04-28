import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './frontend/components/Welcome';
import HomePage from './frontend/components/HomePage'; // Import the HomePage component
import UserProfile from './frontend/components/UserProfile';
import ItemForm from './frontend/components/ItemForm';
import ItemList from './frontend/components/ItemList';
import UserLogin from './frontend/components/UserLogin';
import UserRegistration from './frontend/components/UserRegistration';
import AdminDashboard from './frontend/components/AdminDashboard';
import Notifications from './frontend/components/Notifications';
import Conversation from './frontend/components/ChatTabs';
import { AuthProvider } from './frontend/components/auth/AuthContext'; // Import the AuthProvider
import './App.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/login" element={<UserLogin />} />
                        <Route path="/register" element={<UserRegistration />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/user/profile" element={<UserProfile />} />
                        <Route path="/report" element={<ItemForm />} />
                        <Route path="/items" element={<ItemList />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/chat" element={<Conversation/>} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;