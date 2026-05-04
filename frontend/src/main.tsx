import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { StartupSplash } from "./app/StartupSplash";
import { router } from "./app/router";
import "./index.css";
import { forceDarkTelegramTheme, initTelegramWebApp } from "./tg";

initTelegramWebApp();
forceDarkTelegramTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <StartupSplash>
            <RouterProvider router={router} />
        </StartupSplash>
    </React.StrictMode>
);
