import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './state';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { App } from './App';
import NewScript from './components/new-script-page';
import Queue from './components/queue-page';
import { MyPage } from './components/my-page';

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App><MyPage /></App>} />
                <Route path="my-page" element={<App><MyPage /></App>} />
                <Route path="new-script" element={<App><NewScript /></App>} />
                <Route path="queue" element={<App><Queue /></App>} />
            </Routes>
        </BrowserRouter>
    </Provider>,
    document.getElementById('app-root'));
