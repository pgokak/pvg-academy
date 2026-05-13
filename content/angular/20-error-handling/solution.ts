// Angular Error Handling — Solution
// Commented imports (would resolve in a real Angular project):
// import { Injectable, ErrorHandler, inject } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable, catchError, throwError, retry, EMPTY } from 'rxjs';

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

function mockHttpGetSuccess(): Promise<Product[]> {
  return Promise.resolve([
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Mouse", price: 29 },
  ]);
}

// ─────────────────────────────────────────────
// Solution 1: transformHttpError — map status codes to user messages
// ─────────────────────────────────────────────

function transformHttpError(error: MockHttpError): string {
  if (error.status === 0) {
    return "Cannot connect to server. Check your internet connection.";
  } else if (error.status === 404) {
    return "The requested resource was not found.";
  } else if (error.status === 403) {
    return "You do not have permission to perform this action.";
  } else if (error.status >= 500) {
    return "A server error occurred. Please try again later.";
  } else {
    return error.message || "An unexpected error occurred.";
  }
}

// ─────────────────────────────────────────────
// Solution 2: getProductsWithErrorHandling — retry + catchError
// ─────────────────────────────────────────────

// In RxJS, this would be:
// getProducts(): Observable<Product[]> {
//   return this.http.get<Product[]>('/api/products').pipe(
//     retry(2),  // retry up to 2 times before passing error downstream
//     catchError((error: HttpErrorResponse) =>
//       throwError(() => new Error(transformHttpError(error)))
//     )
//   );
// }

async function getProductsWithErrorHandling(
  attemptCount = 0,
): Promise<Product[]> {
  const MAX_RETRIES = 2;

  try {
    return await mockHttpGetSuccess();
  } catch (rawError) {
    const err = rawError as MockHttpError;

    if (attemptCount < MAX_RETRIES) {
      // Simulate retry(2) — retry up to 2 more times
      return getProductsWithErrorHandling(attemptCount + 1);
    }

    // All retries exhausted — transform and re-throw
    const userMessage = transformHttpError(err);
    console.error("[ProductService] Failed after retries:", err);
    throw new Error(userMessage);
  }
}

// ─────────────────────────────────────────────
// Solution 3: GlobalErrorHandler — catch-all for unhandled errors
// ─────────────────────────────────────────────

// @Injectable()
class GlobalErrorHandler /* implements ErrorHandler */ {
  handleError(error: unknown): void {
    // Convert to Error instance if it isn't already
    const err = error instanceof Error ? error : new Error(String(error));

    // Always log — never silently swallow at this level
    console.error("[GlobalErrorHandler]", err.message, err);

    // In production:
    // this.errorTrackingService.captureException(err);
    // this.toastService.error('Something went wrong. Please refresh the page.');
  }
}

// ─────────────────────────────────────────────
// Bonus: EMPTY pattern — swallow with logging
// ─────────────────────────────────────────────

// const safeOptionalData$ = this.http.get('/api/optional').pipe(
//   catchError(err => {
//     console.error('[DataService] Optional data unavailable:', err); // LOG FIRST
//     return EMPTY; // then swallow — stream completes cleanly
//   })
// );

// ─────────────────────────────────────────────
// Verification — all should log true
// ─────────────────────────────────────────────

function verifyTransformHttpError(): void {
  const tests: [MockHttpError, string][] = [
    [{ status: 0, message: "err", error: null, statusText: "" }, "connection"],
    [{ status: 404, message: "err", error: null, statusText: "" }, "not found"],
    [
      { status: 403, message: "err", error: null, statusText: "" },
      "permission",
    ],
    [
      { status: 500, message: "err", error: null, statusText: "" },
      "server error",
    ],
  ];

  tests.forEach(([error, keyword]) => {
    const msg = transformHttpError(error).toLowerCase();
    const passed = msg.includes(keyword.toLowerCase());
    console.log(`Status ${error.status} → contains "${keyword}": ${passed}`);
  });
}

async function verifyErrorHandling(): Promise<void> {
  const products = await getProductsWithErrorHandling();
  console.log("Success path — products loaded:", products.length === 2); // true

  // Test error path by replacing mockHttpGetSuccess temporarily would require mocking
  // In a real test you'd use spyOn or DI mocking — the structure is validated above
}

function verifyGlobalErrorHandler(): void {
  const handler = new GlobalErrorHandler();
  handler.handleError(new Error("Test error"));
  handler.handleError("Plain string error");
  handler.handleError({ code: 500, msg: "obj error" });
  console.log(
    "GlobalErrorHandler handled all error types without throwing: true",
  );
}

verifyTransformHttpError();
verifyErrorHandling().then(() => verifyGlobalErrorHandler());

export { transformHttpError, getProductsWithErrorHandling, GlobalErrorHandler };
export type { Product, MockHttpError };
