// MODULES & CONFIGURATION — Starter Exercise
//
// PROBLEM: The UserModule below is incomplete.
// It won't work because critical imports and exports are missing.
//
// YOUR TASKS:
// 1. Add HttpClientModule to imports so UserService can make HTTP calls
// 2. Add ReactiveFormsModule to imports so UserFormComponent can use FormBuilder
// 3. Export UserListComponent and UserCardComponent so other modules can use them
// 4. Add UserService to providers (module-scoped, not root-level)
//
// BONUS: Below the NgModule, convert UserCardComponent to a standalone component
// that imports CommonModule directly (no NgModule needed)

// Assume these imports are available:
// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { ReactiveFormsModule } from '@angular/forms';
// import { Component, Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// ─── Components (already declared) ───────────────────────────────────────────
export class UserListComponent {
  users: unknown[] = [];
}

export class UserCardComponent {
  user: unknown = null;
}

export class UserFormComponent {
  // Uses ReactiveFormsModule internally
}

// ─── Service ──────────────────────────────────────────────────────────────────
export class UserService {
  // TODO: inject HttpClient — needs HttpClientModule in the module's imports
  getUsers(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
}

// ─── Task 1-4: Fix this NgModule ──────────────────────────────────────────────
// @NgModule({
//   declarations: [
//     UserListComponent,
//     UserCardComponent,
//     UserFormComponent
//   ],
//   imports: [
//     CommonModule,
//     // TODO: add HttpClientModule
//     // TODO: add ReactiveFormsModule
//   ],
//   exports: [
//     // TODO: export UserListComponent and UserCardComponent
//     // (UserFormComponent stays internal to this module)
//   ],
//   providers: [
//     // TODO: add UserService here (not providedIn: 'root')
//   ]
// })
// export class UserModule {}

// ─── BONUS: Convert to standalone ────────────────────────────────────────────
// Create a new StandaloneUserCardComponent that:
// - Uses standalone: true
// - Imports CommonModule directly in the component
// - Has a template showing a user name with *ngIf to guard against null
// TODO: implement StandaloneUserCardComponent
