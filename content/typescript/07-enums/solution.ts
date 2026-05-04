enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
}

enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
}

function describeTask(status: OrderStatus, priority: Priority): string {
  return `Order is ${status}, priority level ${priority}`;
}

console.log(describeTask(OrderStatus.Pending, Priority.High));
// "Order is pending, priority level 3"

console.log(describeTask(OrderStatus.Shipped, Priority.Low));
// "Order is shipped, priority level 1"
