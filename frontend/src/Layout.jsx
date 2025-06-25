// frontend/src/Layout.jsx

import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Layout.css';

export default function Layout() {
    const { user, logout, isMobile } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getLinkText = (desktop, mobile) => {
        return isMobile ? mobile : desktop;
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <header className="navbar">
                {/* Hamburger Menu Button for Mobile */}
                <button className="hamburger-menu" onClick={toggleMenu}>
                    <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                </button>

                {/* Navigation Links */}
                <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    <NavLink 
                        to="/dashboard" 
                        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        onClick={closeMenu}
                    >
                        {getLinkText('Home', 'Home')}
                    </NavLink>
                    <NavLink 
                        to="/orders" 
                        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        onClick={closeMenu}
                    >
                        {getLinkText('Orders', 'Orders')}
                    </NavLink>
                    <NavLink 
                        to="/appointments" 
                        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        onClick={closeMenu}
                    >
                        {getLinkText('Appointments', 'Appts')}
                    </NavLink>
                    <NavLink 
                        to="/tracking" 
                        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        onClick={closeMenu}
                    >
                        {getLinkText('Tracking', 'Track')}
                    </NavLink>
                    <NavLink 
                        to="/profile" 
                        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        onClick={closeMenu}
                    >
                        {getLinkText('Profile', 'Profile')}
                    </NavLink>
                    {user?.isAdmin && (
                        <NavLink 
                            to="/admin" 
                            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                            onClick={closeMenu}
                        >
                            {getLinkText('Admin', 'Admin')}
                        </NavLink>
                    )}
                    <button className="nav-item logout" onClick={logout}>
                        {getLinkText('Log Out', 'Logout')}
                    </button>
                </div>
            </header>
            <main className="content">
                <Outlet />
            </main>
        </>
    );
}
