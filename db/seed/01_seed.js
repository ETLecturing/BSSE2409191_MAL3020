// This file runs automatically at first container startup.
// It creates collections and inserts initial data.

const dbName = "restaurantdb";
const db = db.getSiblingDB(dbName);


const users = [
  {
    _id: new ObjectId(),
    role: "admin",
    name: "Admin One",
    email: "admin@example.com",
    // For seeding demo  store a placeholder "hash". Real hashing will be done by backend later.
    passwordHash: "hashed:Admin123!",
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    role: "customer",
    name: "Ali",
    email: "ali@example.com",
    passwordHash: "hashed:Password1!",
    createdAt: new Date(),
  },
];

// 2) Menu_Items
const menuItems = [
  {
    _id: new ObjectId(),
    name: "Americano",
    category: "Drinks",
    price: 7.5,
    isAvailable: true,
    image: null,
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Latte",
    category: "Drinks",
    price: 9.0,
    isAvailable: true,
    image: null,
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Chicken Sandwich",
    category: "Meals",
    price: 12.5,
    isAvailable: true,
    image: null,
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Fries",
    category: "Snacks",
    price: 6.0,
    isAvailable: true,
    image: null,
    createdAt: new Date(),
  },
];

// Write users & menu to DB
db.users.insertMany(users);
db.menu_items.insertMany(menuItems);

// 3) Orders (1 sample order for the customer)
const customer = users.find((u) => u.role === "customer");
const latte = menuItems.find((m) => m.name === "Latte");
const fries = menuItems.find((m) => m.name === "Fries");

const orderItems = [
  {
    menuItemId: latte._id,
    name: latte.name,
    unitPrice: latte.price,
    qty: 1,
    lineTotal: latte.price * 1,
  },
  {
    menuItemId: fries._id,
    name: fries.name,
    unitPrice: fries.price,
    qty: 2,
    lineTotal: fries.price * 2,
  },
];

const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
const serviceCharge = Math.round(subtotal * 0.1 * 100) / 100; // 10% service charge

const order = {
  _id: new ObjectId(),
  userId: customer._id,
  items: orderItems,
  subtotal: subtotal,
  serviceCharge: serviceCharge,
  paymentMethod: "online", // cash | card | online
  pickupTime: null, // optional
  status: "Received", // Received | Preparing | Ready | Picked up
  createdAt: new Date(),
  updatedAt: new Date(),
};

db.orders.insertOne(order);

print(
  `[seed] Inserted users: ${users.length}, menu_items: ${menuItems.length}, orders: 1`
);
