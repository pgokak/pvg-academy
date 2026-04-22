//What this does:
// Adds extra matchers to Vitest like toBeInTheDocument(), toHaveText(), toBeVisible() — things that make sense in a browser context but don't exist in plain Vitest.
//Without this line, you'd get an error saying toBeInTheDocument is not a function.
import "@testing-library/jest-dom"; // Provides custom Jest matchers for asserting on DOM nodes, such as `toBeInTheDocument()`, `toHaveClass()`, etc. This enhances the readability and expressiveness of your tests when working with the DOM.
