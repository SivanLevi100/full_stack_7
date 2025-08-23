/**
 * Application entry point
 * Renders the React app into the DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create the root of the application in the HTML document
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application with StrictMode for development checks
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);