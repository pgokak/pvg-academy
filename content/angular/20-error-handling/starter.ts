// Angular Error Handling — Starter Exercise
// Commented imports (would resolve in a real Angular project):
// import { Injectable, ErrorHandler, inject } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable, catchError, throwError, retry, EMPTY } from 'rxjs';

// ─────────────────────────────────────────────
// Simulated HTTP response types (no Angular needed)
// ─────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  price: number;
}

interface MockHttpError {
  status: number;
  message: string;
  error: unknown;
  statusText: string;
}

// Simulate a failed HTTP call
function mockHttpGet(simulatedStatus: number): Promise<Product[]> {
  return new Promise((_, reject) => {
    const err: MockHttpError = {
      status: simulatedStatus,
      message: `Http failure response: ${simulatedStatus}`,
      error:
        simulatedStatus === 0
          ? new Error("Network error")
          : { message: "Server error" },
      statusText:
        simulatedStatus === 404 ? "Not Found" : "Internal Server Error",
    };
    reject(err);
  });
}

// Simulate a successful HTTP call
function mockHttpGetSuccess(): Promise<Product[]> {
  return Promise.resolve([
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Mouse", price: 29 },
  ]);
}

// ─────────────────────────────────────────────
// TODO 1: Implement transformHttpError()
// Given a MockHttpError, return a user-friendly string message:
//   - status 0     → 'Cannot connect to server. Check your internet connection.'
//   - status 404   → 'The requested resource was not found.'
//   - status 403   → 'You do not have permission to perform this action.'
//   - status >= 500 → 'A server error occurred. Please try again later.'
//   - other        → use error.message
// ─────────────────────────────────────────────

function transformHttpError(error: MockHttpError): string {
  // TODO: implement this function
  return "An error occurred."; // replace this
}

// ─────────────────────────────────────────────
// TODO 2: Implement getProductsWithErrorHandling()
// - Call mockHttpGetSuccess() (or mockHttpGet(500) to test error path)
// - If an error is thrown, call transformHttpError() and throw a new Error with that message
// - Add retry: try the request up to 2 times before giving up
// ─────────────────────────────────────────────

async function getProductsWithErrorHandling(): Promise<Product[]> {
  // TODO: wrap mockHttpGetSuccess() in try/catch
  // If it throws, call transformHttpError() and re-throw as a new Error
  // Hint: in RxJS you'd use: .pipe(retry(2), catchError(err => throwError(() => new Error(transformHttpError(err)))))
  return mockHttpGetSuccess(); // replace with error-handled version
}

// ─────────────────────────────────────────────
// TODO 3: Implement a basic GlobalErrorHandler class
// It should have a handleError(error: unknown) method that:
// - Converts the error to an Error instance (if it isn't already)
// - Logs '[GlobalErrorHandler] <message>' to console.error
// - In a real app, would send to an error tracking service
// ─────────────────────────────────────────────

// @Injectable()
class GlobalErrorHandler /* implements ErrorHandler */ {
  handleError(error: unknown): void {
    // TODO: implement this method
  }
}

// ─────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────

function verifyTransformHttpError(): void {
  const networkError: MockHttpError = {
    status: 0,
    message: "Network error",
    error: null,
    statusText: "",
  };
  const notFoundError: MockHttpError = {
    status: 404,
    message: "Not Found",
    error: null,
    statusText: "Not Found",
  };
  const serverError: MockHttpError = {
    status: 500,
    message: "Server Error",
    error: null,
    statusText: "Internal Server Error",
  };
  const authError: MockHttpError = {
    status: 403,
    message: "Forbidden",
    error: null,
    statusText: "Forbidden",
  };

  console.log("Network error message:", transformHttpError(networkError)); // should mention connection
  console.log("404 error message:", transformHttpError(notFoundError)); // should mention not found
  console.log("403 error message:", transformHttpError(authError)); // should mention permission
  console.log("500 error message:", transformHttpError(serverError)); // should mention server error
}

async function verifyErrorHandling(): Promise<void> {
  try {
    const products = await getProductsWithErrorHandling();
    console.log("Products loaded:", products.length > 0); // should be true on success path
  } catch (err) {
    console.log("Error caught and transformed:", err instanceof Error); // should be true on error path
  }
}

function verifyGlobalErrorHandler(): void {
  const handler = new GlobalErrorHandler();
  // Should not throw — just log
  handler.handleError(new Error("Test error"));
  handler.handleError("Plain string error");
  console.log("GlobalErrorHandler handled errors without throwing: true");
}

verifyTransformHttpError();
verifyErrorHandling().then(() => verifyGlobalErrorHandler());

export { transformHttpError, getProductsWithErrorHandling, GlobalErrorHandler };
export type { Product, MockHttpError };
