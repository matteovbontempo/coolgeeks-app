import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            
            // Make API call to save changes
            const token = localStorage.getItem('token');
            const response = await axios.put('/api/auth/update-profile', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update the user context with new data
            if (updateUser) {
                updateUser({
                    ...user,
                    ...response.data.data
                });
            }
            
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
                <div className="profile-info">
                    <h1>{user?.name || 'User'}</h1>
                    <p className="user-role">{user?.isAdmin ? 'Administrator' : 'Customer'}</p>
                </div>
            </div>

            <div className="profile-sections">
                {/* Personal Information */}
                <div className="profile-section">
                    <div className="section-header">
                        <h2>Personal Information</h2>
                        <button 
                            className="edit-btn"
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isSaving}
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                    
                    <div className="form-group">
                        <label>Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="info-text">{user?.name || 'Not specified'}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="info-text">{user?.email || 'Not specified'}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="info-text">{user?.phone || 'Not specified'}</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="edit-actions">
                            <button 
                                className="save-btn" 
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                className="cancel-btn" 
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <div className="profile-section">
                    <h2>Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">12</div>
                            <div className="stat-label">Orders</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">5</div>
                            <div className="stat-label">Appointments</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">3</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="profile-section">
                    <h2>Settings</h2>
                    <div className="settings-list">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>Notifications</h3>
                                <p>Receive alerts about orders and appointments</p>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="profile-section">
                    <h2>Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn secondary">
                            Change Password
                        </button>
                        <button className="action-btn secondary">
                            Export Data
                        </button>
                        <button className="action-btn danger" onClick={logout}>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 