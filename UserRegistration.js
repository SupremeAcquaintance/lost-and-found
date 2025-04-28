import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'; 
import './styles/User Registration.css'; 
import axios from 'axios'; 
import Notification from './Notification'; // Import message component

const UserRegistration = () => { 
    const [RegNumber, setRegNumber] = useState('');
    const [Residence, setResidence] = useState('');
    const [Username, setUsername] = useState(''); 
    const [Email, setEmail] = useState(''); 
    const [Phone, setPhone] = useState('');  
    const [UserType, setUserType] = useState('Student'); 
    const [PasswordHash, setPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const [notification, setNotification] = useState({ message: '', type: '' }); // Notification state
    const navigate = useNavigate();

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        const userData = { RegNumber, Username, Email, Phone, UserType, PasswordHash, Residence }; 


        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/register', userData);

            if (response.status === 201) {
                setNotification({ message: 'Registration successful!', type: 'success' });
                navigate('/login');
            } else {
                setNotification({ message: 'Registration failed! Please check your details.', type: 'error' });
            }

            // Reset form fields
            setUsername('');
            setRegNumber('');
            setEmail('');
            setPhone('');
            setPassword('');
            setUserType('Student'); 
        } catch (error) {
            console.error('Error during registration:', error);
            setNotification({ message: 'Email, username, or registration number already registered', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return ( 
        <div className='registration-page'> 
            <p>Join the community to report lost items and help others find theirs.</p> 
            <div className="registration-container"> 
                <FontAwesomeIcon icon={faUserPlus} size="3x" className="registration-icon" /> 
                <h2>Register</h2> 
                {notification.message && <Notification message={notification.message} type={notification.type} />} {/* Notification component */}
                <form onSubmit={handleSubmit} className="registration-form"> 
                    <input type="text" 
                    placeholder="RegNumber (e.g., R123456A)" 
                    value={RegNumber} 
                    onChange={(e) => setRegNumber(e.target.value)} 
                    required /> 
                    <input type="text" 
                    placeholder="Username" 
                    value={Username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required /> 
                    <input type="email" 
                    placeholder="Email (e.g., username@uz.ac.zw)" 
                    value={Email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required /> 
                    <input type="number" 
                    placeholder="Phone (10 digits)" 
                    value={Phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required /> 
                    <select value={UserType} 
                    onChange={(e) => setUserType(e.target.value)}
                    required > 
                        <option value="Student">Student</option> 
                        <option value="Staff">Staff</option> 
                    </select> 
                    <input type="password"
                    placeholder="Password" 
                    value={PasswordHash} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required /> 
                    <input type="text" 
                    placeholder="Residence (e.g., Manfred Hall UZ Campus OR 40 Eping Rd)" 
                    value={Residence} 
                    onChange={(e) => setResidence(e.target.value)} 
                    required />
                    <button type="submit" className="btn" disabled={loading}> 
                        {loading ? 'Registering...' : 'Register'} 
                    </button> 
                </form> 
                <p className="login-prompt"> 
                    Already have an account? 
                    <button 
                        onClick={() => navigate('/login')} 
                        className="link-btn">Sign In
                    </button> 
                </p> 
            </div> 
        </div> 
    ); 
};

export default UserRegistration;