import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { App } from './App';
import { Queue } from './components/queue';
import { Scripts } from './components/scripts';

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App><Scripts /></App>} />
            <Route path="scripts" element={<App><Scripts /></App>} />
            <Route path="queue" element={<App><Queue /></App>} />
        </Routes>
    </BrowserRouter>,
    document.getElementById('app-root'));
