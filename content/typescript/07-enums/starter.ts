// Exercise: Replace the magic strings/numbers with proper enums.

// 1. Create a string enum for order status
// Values: Pending="pending", Processing="processing", Shipped="shipped", Delivered="delivered"
enum OrderStatus {
  // your code here
}

// 2. Create a numeric enum for task priority starting at 1
// Low=1, Medium=2, High=3
enum Priority {
  // your code here
}

// 3. Use both enums in this function
function describeTask(status: OrderStatus, priority: Priority): string {
  return `Order is ${status}, priority level ${priority}`;
}

// These should work after you fill in the enums:
console.log(describeTask(OrderStatus.Pending, Priority.High));
// Expected: "Order is pending, priority level 3"

console.log(describeTask(OrderStatus.Shipped, Priority.Low));
// Expected: "Order is shipped, priority level 1"
