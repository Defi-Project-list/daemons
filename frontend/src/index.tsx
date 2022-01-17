import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { App } from './App';
import { CreateScripts } from './components/create-script-page';
import GasTank from './components/gas-tank-page';
import Queue from './components/queue-page';
import Scripts from './components/scripts-page';

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App><Scripts /></App>} />
            <Route path="scripts" element={<App><Scripts /></App>} />
            <Route path="new-script" element={<App><CreateScripts /></App>} />
            <Route path="gas-tank" element={<App><GasTank /></App>} />
            <Route path="queue" element={<App><Queue /></App>} />
        </Routes>
    </BrowserRouter>,
    document.getElementById('app-root'));
