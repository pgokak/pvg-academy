---
title: "useState"
track: "react"
version: "React 19.x"
since: 2019
stable: true
---

## What Is State?

Props are data passed **into** a component. State is data that lives **inside** a component and can change over time.

When state changes, React automatically re-renders the component with the new value. This is the core mechanism behind interactive UIs.

---

## The useState Hook

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

`useState(0)` returns a **tuple** — two things:

- `count` — the current value (starts at `0`)
- `setCount` — a function to update the value

Calling `setCount(count + 1)` tells React: "update the state, then re-render this component."

---

## TypeScript and useState

TypeScript infers the state type from the initial value:

```ts
const [count, setCount] = useState(0); // inferred: number
const [name, setName] = useState("Prashant"); // inferred: string
```

When the initial value is `null` or the type is complex, provide it explicitly:

```ts
const [user, setUser] = useState<User | null>(null);
```

This tells TypeScript: "this state holds a User or null — not just null forever."

---

## State Updates Are Asynchronous

React batches state updates for performance. If you need the latest state to compute the next one, use the **function form**:

```ts
// ❌ May use stale value in some cases
setCount(count + 1);

// ✅ Always uses the latest state
setCount((prev) => prev + 1);
```

For simple cases like button clicks, both work. Use the function form whenever you're updating state inside loops, timeouts, or async functions.

---

## Multiple State Variables

Each `useState` call manages one independent piece of state:

```tsx
function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setSubmitted(true);
    console.log(name, email);
  }
}
```

Keep state minimal — only store values that can't be computed from other state or props.

---

## Object State

You can also store objects, but you must spread the existing state to preserve other fields:

```ts
const [user, setUser] = useState({ name: "", email: "" });

// ❌ Wrong — replaces the whole object, loses 'email'
setUser({ name: "Prashant" });

// ✅ Correct — spread existing state, override only what changed
setUser((prev) => ({ ...prev, name: "Prashant" }));
```

---

## Summary

- `useState` returns `[currentValue, setter]`
- TypeScript infers the type from the initial value
- For nullable or complex types, provide the generic: `useState<Type>(initialValue)`
- Use the function form of the setter when the new value depends on the previous value
- Spread existing object state to avoid accidentally deleting fields
