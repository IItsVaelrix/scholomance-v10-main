// tests/accessibility.test.js
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import GrimoireScroll from "../src/pages/Read/GrimoireScroll";

expect.extend(toHaveNoViolations);

describe("Accessibility Suite", () => {
  it("should have no accessibility violations in the main App layout", async () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("GrimoireScroll should be keyboard accessible", async () => {
    const { container } = render(
      <GrimoireScroll 
        text="The quick brown fox" 
        onWordClick={() => {}} 
        isEngineReady={true} 
      />
    );
    
    // Check for violations
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Ensure words are buttons
    const buttons = container.querySelectorAll('.grimoire-word');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(btn => {
      expect(btn.tagName).toBe('BUTTON');
      expect(btn).toHaveAttribute('aria-label');
    });
  });
});
