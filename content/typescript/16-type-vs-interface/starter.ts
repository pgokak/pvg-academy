// Exercise: Each definition below uses `type`. Some should stay as `type`,
// others should be converted to `interface`. Read the comment and decide.

// 1. Component props — will be extended by other component prop types
// Should this be type or interface? Convert if needed. Then use `extends` (not &) for IconButtonProps.
type ButtonProps = {
  label: string;
  onClick(): void;
};
type IconButtonProps = ButtonProps & { icon: string };

// 2. An API response that's either success or failure
// Should this be type or interface? (Hint: can interface represent a union?)
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

// 3. A simple alias for a user's ID (just a number)
// Should this be type or interface? (Hint: can interface alias a primitive?)
type UserId = number;

// 4. A service contract that multiple classes will implement
// Should this be type or interface?
type EmailService = {
  send(to: string, subject: string, body: string): Promise<void>;
};

// 5. A combination of two shapes
// Should HasId and HasTimestamps be type or interface?
type HasId = { id: number };
type HasTimestamps = { createdAt: Date; updatedAt: Date };
type BaseRecord = HasId & HasTimestamps;

// --- Tests — these should all compile after your changes ---

const btn: ButtonProps = { label: "Click me", onClick: () => {} };
const iconBtn: IconButtonProps = {
  label: "Save",
  onClick: () => {},
  icon: "💾",
};
console.log(btn.label, iconBtn.icon);

const success: ApiResult<string> = { ok: true, data: "hello" };
const failure: ApiResult<string> = { ok: false, error: "not found" };
console.log(success, failure);

const id: UserId = 42;
console.log(id);

class MockEmailService implements EmailService {
  async send(to: string, subject: string, _body: string): Promise<void> {
    console.log(`Sending to ${to}: ${subject}`);
  }
}
new MockEmailService().send("p@g.com", "Hello", "World");

const record: BaseRecord = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};
console.log(record.id);
