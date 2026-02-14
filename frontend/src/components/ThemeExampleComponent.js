import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../css/theme.css";

/**
 * Example Component: Using Theme Context
 * 
 * This example demonstrates how to:
 * 1. Access the theme using useTheme hook
 * 2. Conditionally render content based on active theme
 * 3. Use CSS variables for styling
 * 4. Implement dynamic styling based on theme
 */

const ThemeExampleComponent = () => {
  const { theme, toggleTheme, isLoading } = useTheme();

  if (isLoading) {
    return <div className="loading">Loading theme...</div>;
  }

  return (
    <div className="theme-example-container">
      {/* Section 1: Basic Theme Information */}
      <section className="theme-info-section">
        <h2>Current Theme</h2>
        <div className="theme-badge">
          <span className="badge-label">Active Theme:</span>
          <span className={`badge ${theme}`}>{theme.toUpperCase()}</span>
        </div>
        <button className="toggle-btn" onClick={toggleTheme}>
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </section>

      {/* Section 2: Color Palette Display */}
      <section className="theme-palette-section">
        <h2>Available Colors</h2>
        <div className="color-grid">
          {/* Primary Colors */}
          <div className="color-card">
            <div className="color-box primary"></div>
            <div className="color-info">
              <p className="color-name">Primary</p>
              <p className="color-usage">Buttons, Links, Highlights</p>
            </div>
          </div>

          {/* Accent Colors */}
          <div className="color-card">
            <div className="color-box accent"></div>
            <div className="color-info">
              <p className="color-name">Accent</p>
              <p className="color-usage">Success, Positive Actions</p>
            </div>
          </div>

          {/* Danger Colors */}
          <div className="color-card">
            <div className="color-box danger"></div>
            <div className="color-info">
              <p className="color-name">Danger</p>
              <p className="color-usage">Errors, Delete Actions</p>
            </div>
          </div>

          {/* Warning Colors */}
          <div className="color-card">
            <div className="color-box warning"></div>
            <div className="color-info">
              <p className="color-name">Warning</p>
              <p className="color-usage">Alerts, Cautions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Component Examples */}
      <section className="theme-components-section">
        <h2>Component Examples</h2>

        {/* Buttons */}
        <div className="component-group">
          <h3>Buttons</h3>
          <div className="button-showcase">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-accent">Accent Button</button>
            <button className="btn btn-danger">Danger Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
          </div>
        </div>

        {/* Cards */}
        <div className="component-group">
          <h3>Cards</h3>
          <div className="card-showcase">
            <div className="card">
              <h4>Primary Card</h4>
              <p>
                This is a primary card with secondary text. It demonstrates
                how the theme variables work in card components.
              </p>
            </div>
            <div className="card accent-card">
              <h4>Accent Card</h4>
              <p>
                This is an accent card. It uses the accent theme colors to
                highlight important information.
              </p>
            </div>
          </div>
        </div>

        {/* Text Styles */}
        <div className="component-group">
          <h3>Text Hierarchy</h3>
          <div className="text-showcase">
            <h1>Heading 1 (Primary Text)</h1>
            <h2>Heading 2 (Primary Text)</h2>
            <p className="text-primary">Primary text for body content</p>
            <p className="text-secondary">Secondary text for supporting info</p>
            <p className="text-tertiary">Tertiary text for hints and labels</p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="component-group">
          <h3>Form Elements</h3>
          <div className="form-showcase">
            <input
              type="text"
              placeholder="Text input with theme styling"
              className="input-field"
            />
            <select className="input-field">
              <option>Select option with theme styling</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <textarea
              placeholder="Textarea with theme styling"
              className="input-field"
            ></textarea>
          </div>
        </div>
      </section>

      {/* Section 4: CSS Variables Inspector */}
      <section className="theme-variables-section">
        <h2>CSS Variables in Use</h2>
        <div className="variables-list">
          <div className="variable-item">
            <code>--primary-color</code>
            <span
              className="variable-value"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></span>
          </div>
          <div className="variable-item">
            <code>--accent-color</code>
            <span
              className="variable-value"
              style={{ backgroundColor: "var(--accent-color)" }}
            ></span>
          </div>
          <div className="variable-item">
            <code>--bg-color</code>
            <span
              className="variable-value"
              style={{ backgroundColor: "var(--bg-color)" }}
            ></span>
          </div>
          <div className="variable-item">
            <code>--surface-color</code>
            <span
              className="variable-value"
              style={{ backgroundColor: "var(--surface-color)" }}
            ></span>
          </div>
          <div className="variable-item">
            <code>--text-primary</code>
            <span
              className="variable-value"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--surface-color)",
              }}
            ></span>
          </div>
        </div>
      </section>

      {/* Section 5: Code Examples */}
      <section className="theme-code-section">
        <h2>How to Use in Your Code</h2>

        <div className="code-example">
          <h3>Using CSS Variables</h3>
          <pre>
            {`/* In your CSS file */
.my-component {
  background-color: var(--surface-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}`}
          </pre>
        </div>

        <div className="code-example">
          <h3>Using Theme Hook</h3>
          <pre>
            {`// In your React component
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}`}
          </pre>
        </div>

        <div className="code-example">
          <h3>Conditional Rendering</h3>
          <pre>
            {`// Render different content based on theme
const { theme } = useTheme();

{theme === 'dark' && (
  <img src="/dark-mode-image.svg" alt="Dark mode" />
)}

{theme === 'light' && (
  <img src="/light-mode-image.svg" alt="Light mode" />
)}`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ThemeExampleComponent;
