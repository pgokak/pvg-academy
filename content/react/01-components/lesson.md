---
title: "Components and Props"
track: "react"
version: "React 19.x"
since: 2013
stable: true
---

## What Is a Component?

A React component is a **function that returns JSX** — a description of what should appear on screen.

```tsx
function Greeting() {
  return <h1>Hello, world!</h1>;
}
```

That's it. A component is just a function. React calls it and renders the returned JSX into the DOM.

Component names must start with a capital letter — `Greeting`, not `greeting`. React uses this to tell components apart from plain HTML elements.

---

## Props: Passing Data Into Components

Props (short for properties) are how you pass data into a component. They work like function arguments:

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage:
<Greeting name="Prashant" />   // renders: Hello, Prashant!
<Greeting name="Gokak" />      // renders: Hello, Gokak!
```

The `{ name }` in the parameter is **destructuring** — pulling the `name` field out of the props object. The `{ name: string }` after the colon is the TypeScript type.

---

## Typing Props with an Interface

For components with multiple props, define an interface:

```tsx
interface CardProps {
  title: string;
  description: string;
  badge?: string; // optional
}

function Card({ title, description, badge }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {badge && <span>{badge}</span>}
    </div>
  );
}
```

This is the standard pattern in professional React codebases. TypeScript now catches:

- Missing required props
- Props with the wrong type
- Typos in prop names

---

## Children

`children` is a special prop — it represents whatever JSX you put between the opening and closing tags:

```tsx
interface BoxProps {
  children: React.ReactNode;
}

function Box({ children }: BoxProps) {
  return <div className="border p-4">{children}</div>;
}

// Usage:
<Box>
  <h1>Title</h1>
  <p>Any content here</p>
</Box>;
```

`React.ReactNode` is the correct type for children — it accepts JSX, strings, numbers, arrays, or null.

---

## Components Are Composable

The real power of components is that you build complex UIs by combining simple ones:

```tsx
function App() {
  return (
    <div>
      <Card
        title="TypeScript"
        description="Learn types and interfaces"
        badge="New"
      />
      <Card title="React" description="Build component-based UIs" />
    </div>
  );
}
```

Each `Card` is independent. Change `Card` once — every usage updates automatically.

---

## Summary

- A component is a function that returns JSX
- Component names must start with a capital letter
- Props are the function's parameters — typed with an interface
- `children` lets you nest JSX inside a component
- Build complex UIs by composing simple components
