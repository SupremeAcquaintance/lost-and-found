import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faUpload, faTimes, faHistory, faSearch, faHome } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './auth/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './styles/ItemForm.css';

// Define the ItemFormTabs component for tabular navigation between reporting lost/found items and viewing history
const ItemFormTabs = () => { 
  const { userEmail } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('lost'); // State to manage the active tab (lost or found or history)
  const [itemData, setItemData] = useState({
    itemName: '',
    description: '',
    category: '',
    location: '',
    image: null,
  }); // State to manage item data input by the user

  // State to manage matched items and modal visibility
  const [matchedItem, setMatchedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Function to fetch the user's report history from the backend
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/items/history/${userEmail}`); 
      setHistory(res.data);
    } catch (err) {
      toast.error("Failed to fetch history");
    }
  }, [userEmail]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]); // Fetch history when the active tab changes to history

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value }); // Update the itemData state with the new value
  };

  const handleFileChange = (e) => { // Handle file input change
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    setItemData({ ...itemData, image: file });
  };

  // Function to handle form submission for reporting lost/found items
  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = activeTab === 'lost' ? 'Lost' : 'Found';

    if (!itemData.itemName || !itemData.location || !itemData.description) {
      toast.warning("Please fill in all required fields!");
      return;
    }

    // Create a FormData object to send the data as multipart/form-data
    const formData = new FormData();
    Object.entries(itemData).forEach(([key, value]) => formData.append(key, value));
    formData.append('status', status);
    formData.append('userEmail', userEmail);

    setLoading(true);
    try { // Send the form data to the backend API
      const response = await axios.post('http://localhost:3000/api/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(response.data.message || "Item reported successfully!"); // Success message

      // Check for matched items
      if (response.data.matchedItems && response.data.matchedItems.length > 0) { 
        setMatchedItem(response.data.matchedItems); // Set matched items from the response
        setShowModal(true);
      }
      
      // Reset form fields
      setItemData({ itemName: '', description: '', category: '', location: '', image: null }); // Reset form fields

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit item");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => { // Render content based on the active tab
    if (activeTab === 'history') { // Render history tab content
      return (
        <div className="history-container">
          <h3><FontAwesomeIcon icon={faHistory} /> Your Report History</h3>
          <div className="history-grid">
          {history.length === 0 ? (
            <p>No items reported yet.</p>
          ) : (
            history.map(item => {
              let imageUrl = null;
              if (item.Picture?.data) {
                const blob = new Blob([new Uint8Array(item.Picture.data)], { type: 'image/jpeg' });
                imageUrl = URL.createObjectURL(blob);
              }

              return (
                  <div key={item.ItemID} className="history-card">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Reported Item"
                        className="history-image"
                      />
                    )}
        
                      <p><strong>{item.ItemName}</strong> ({item.Status})</p>
                      <p>{item.Description}</p>
                      <p><em>Location: {item.Location}</em></p>

                  </div>
              );
            })
          )}
          </div>
        </div>
      );
    }
    

    return ( // Render lost/found item reporting form
      <form onSubmit={handleSubmit} className="item-form">
        <input type="text" name="itemName" placeholder="Item Name" value={itemData.itemName} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={itemData.description} onChange={handleChange} required />
        <input type="text" name="category" placeholder="Category" value={itemData.category} onChange={handleChange} />
        <input type="text" name="location" placeholder="Location Found/Lost" value={itemData.location} onChange={handleChange} required />

        <label className="upload-label">
          <FontAwesomeIcon icon={faUpload} /> Upload Image
          <input type="file" onChange={handleFileChange} accept="image/*" hidden />
        </label>

        {itemData.image && (
          <img src={URL.createObjectURL(itemData.image)} alt="Preview" className="image-preview" />
        )}

        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
    );
  };

  return ( // Render the main component
    <div className='reports'>
      <h1 className='banner'>Reports</h1>
      <div className="item-form-container">
        <ToastContainer position="top-center" autoClose={8000} hideProgressBar />
        <div className="tab-buttons">
        <button onClick={() => navigate('/home')} className="home-btn">
          <FontAwesomeIcon icon={faHome} style={{ marginRight: '5px' }} className='home-icon' />GO HOME
        </button>
          <button className={`tab-button ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>
            <FontAwesomeIcon icon={faPlusCircle} /> Report Lost
          </button>
          <button className={`tab-button ${activeTab === 'found' ? 'active' : ''}`} onClick={() => setActiveTab('found')}>
            <FontAwesomeIcon icon={faSearch} /> Report Found
          </button>
          <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <FontAwesomeIcon icon={faHistory} /> History
          </button>
        </div>

        <div className="tab-content">{renderTabContent()}</div>

        {showModal && matchedItem && matchedItem.length > 0 && ( // Render modal if there are matched items
          <div className="match-modal-overlay">
            <div className="match-modal">
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h3>Potential Matches Found!</h3>
              {matchedItem.map((item, index) => {
                const base64Image = item.Picture?.data
                  ? `data:image/jpeg;base64,${Buffer.from(item.Picture.data).toString('base64')}`
                  : null;

                return (
                  <div key={index} className="matched-item">
                    {base64Image && <img src={base64Image} alt="Matched Item" className="matched-image" />}
                    <p><strong>Item:</strong> {item.ItemName}</p>
                    <p><strong>Description:</strong> {item.Description}</p>
                    <p><strong>Category:</strong> {item.Category}</p>
                    <p><strong>Location:</strong> {item.Location}</p>
                    <p><strong>Status:</strong> {item.Status}</p>
                    <p><strong>Reported by:</strong> {item.Email}</p>
                    <hr />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemFormTabs; // Export the ItemFormTabs component for use in in reporting and viewing history in the app
// This component allows users to report lost or found items, view their report history, and see potential matches for their reported items.
//  It uses React hooks for state management and axios for API calls, along with FontAwesome icons for UI elements. 
// The component also includes form validation and error handling using react-toastify for notifications.
