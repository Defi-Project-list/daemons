import React from 'react';
import { Provider } from 'react-redux';
import { store } from './state';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { DashboardPage } from './pages/dashboard';
import { MyPage } from './pages/my-page';
import { ExecutePage } from './pages/execute';
import { ScriptDesignerPage } from "./pages/script-designer";
import { ReviewPage } from "./pages/review";
import { TransactionsPage } from "./pages/transactions";
import { VestingPage } from "./pages/vesting";
import { createRoot } from 'react-dom/client';
import { SwapPage } from "./pages/swap";


const container = document.getElementById('app-root');
const root = createRoot(container!);
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App><DashboardPage /></App>} />
                <Route path="my-page" element={<App><MyPage /></App>} />
                <Route path="new-script" element={<App><ScriptDesignerPage /></App>} />
                <Route path="review" element={<App><ReviewPage /></App>} />
                <Route path="execute" element={<App><ExecutePage /></App>} />
                <Route path="transactions" element={<App><TransactionsPage/></App>} />
                <Route path="vesting" element={<App><VestingPage/></App>} />
                <Route path="swap" element={<App><SwapPage/></App>} />
            </Routes>
        </BrowserRouter>
    </Provider>
);
