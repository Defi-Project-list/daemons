import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { createRoot } from 'react-dom/client';
import { ExecutePage } from "./pages/execute";

const container = document.getElementById('app-root');
const root = createRoot(container!);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App><ExecutePage/></App>} />
        </Routes>
    </BrowserRouter>,
);
