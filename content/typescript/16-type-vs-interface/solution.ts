interface ButtonProps {
  label: string;
  onClick(): void;
}
interface IconButtonProps extends ButtonProps {
  icon: string;
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

type UserId = number;

interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

type HasId = { id: number };
type HasTimestamps = { createdAt: Date; updatedAt: Date };
type BaseRecord = HasId & HasTimestamps;

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
  async send(to: string, subject: string, body: string): Promise<void> {
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
