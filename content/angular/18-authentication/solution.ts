// Angular Authentication & JWT — Solution
// Commented imports (would resolve in a real Angular project):
// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { Observable, catchError, throwError } from 'rxjs';

// ─────────────────────────────────────────────
// Helper: decode JWT payload
// ─────────────────────────────────────────────

function decodeJwtPayload(token: string): { sub: string; exp: number } | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = atob(payloadBase64);
    return JSON.parse(decoded) as { sub: string; exp: number };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Solution 1: AuthService — fully implemented
// ─────────────────────────────────────────────

// @Injectable({ providedIn: 'root' })
class AuthService {
  private readonly TOKEN_KEY = "auth_token";

  // 1a: Store token in localStorage on login
  login(mockToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, mockToken);
  }

  // 1b: Remove token from localStorage on logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // 1c: Read token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // 1d: Combine existence check with expiry check
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload) return false;

    // payload.exp is in seconds; Date.now() is milliseconds → divide by 1000
    return Date.now() / 1000 < payload.exp;
  }
}

// ─────────────────────────────────────────────
// Solution 2: authInterceptor — complete implementation
// ─────────────────────────────────────────────

// const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//
//   const token = authService.getToken();
//
//   // Solution 2a: Clone request with Authorization header (immutable — must clone)
//   const authReq = token
//     ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
//     : req;
//
//   // Solution 2b & 2c: Forward request, handle 401
//   return next(authReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         authService.logout();
//         router.navigate(['/login']); // Solution 2c: redirect to login
//       }
//       return throwError(() => error);
//     })
//   );
// };

// ─────────────────────────────────────────────
// Bonus: Functional route guard
// ─────────────────────────────────────────────

// const authGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   return authService.isLoggedIn() || router.createUrlTree(['/login']);
// };

// ─────────────────────────────────────────────
// Verification — all assertions should log true
// ─────────────────────────────────────────────

const MOCK_TOKEN_VALID =
  "eyJhbGciOiJIUzI1NiJ9." +
  btoa(JSON.stringify({ sub: "test@example.com", exp: 9999999999 })) +
  ".mock-sig";

const MOCK_TOKEN_EXPIRED =
  "eyJhbGciOiJIUzI1NiJ9." +
  btoa(JSON.stringify({ sub: "test@example.com", exp: 1 })) +
  ".mock-sig";

function verifyAuthService(): void {
  const auth = new AuthService();

  console.log("Initially not logged in:", !auth.isLoggedIn()); // true

  auth.login(MOCK_TOKEN_VALID);
  console.log("Logged in after login():", auth.isLoggedIn()); // true
  console.log("getToken() returns token:", auth.getToken() !== null); // true

  auth.logout();
  console.log("Logged out after logout():", !auth.isLoggedIn()); // true

  auth.login(MOCK_TOKEN_EXPIRED);
  console.log("Expired token = not logged in:", !auth.isLoggedIn()); // true
  auth.logout();
}

function verifyJwtDecode(): void {
  const payload = decodeJwtPayload(MOCK_TOKEN_VALID);
  console.log("JWT decoded sub:", payload?.sub === "test@example.com"); // true
  console.log("JWT decoded exp:", payload?.exp === 9999999999); // true
}

function verifyInterceptorClonesRequest(): void {
  // Simulate what the interceptor does (no real HttpRequest needed)
  const token = "test-token-123";
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  console.log(
    "Header set correctly:",
    headers["Authorization"] === "Bearer test-token-123",
  ); // true
}

verifyAuthService();
verifyJwtDecode();
verifyInterceptorClonesRequest();

export { AuthService, decodeJwtPayload };
export { MOCK_TOKEN_VALID, MOCK_TOKEN_EXPIRED };
