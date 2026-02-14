import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import "./css/theme.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
