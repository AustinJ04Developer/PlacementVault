import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App.js';

describe('PlacementVault Client Application', () => {
  it('renders application navigation and brand name', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/Placement/i);
    expect(brandElements.length).toBeGreaterThan(0);
    expect(brandElements[0]).toBeInTheDocument();
  });

  it('renders questions navigation link', () => {
    render(<App />);
    const questionsLinks = screen.getAllByText(/Questions/i);
    expect(questionsLinks.length).toBeGreaterThan(0);
    expect(questionsLinks[0]).toBeInTheDocument();
  });

  it('renders sign up action button', () => {
    render(<App />);
    const signUpBtn = screen.getByText(/Sign Up/i);
    expect(signUpBtn).toBeInTheDocument();
  });
});
