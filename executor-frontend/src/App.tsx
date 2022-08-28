import React from "react";
import logo from "./assets/logo.svg";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./fonts.css";
import "./constants.css";
import "./app.css";
import "./pages/shared.css";

export const App = ({ children }: { children: any }) => {
    return (
        <div>
            <ToastContainer />
            <div className="header">
                <img src={logo} alt="Daemons logo" className="page-logo" />
                <div className="page-logo__beta-sign">BETA</div>
            </div>

            <div className="page">{children}</div>
        </div>
    );
};
