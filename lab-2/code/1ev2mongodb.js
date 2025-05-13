const newOrderId = 12345;

 db.orders.insertOne({
  OrderID: newOrderId,
  CustomerID: "ALFKI",
  EmployeeID: 5,
  OrderDate: ISODate("2025-04-16T00:00:00Z"),
  RequiredDate: ISODate("2025-05-16T00:00:00Z"),
  ShipVia: 3,
  Freight: 15.00,
  ShipName: "Alfreds Futterkiste",
  ShipAddress: "Obere Str. 57",
  ShipCity: "Berlin",
  ShipCountry: "Germany"
});

db.orderdetails.insertMany([
  {
    OrderID: newOrderId,
    ProductID: 1,
    UnitPrice: 18.00,
    Quantity: 10,
    Discount: 0
  },
  {
    OrderID: newOrderId,
    ProductID: 31,
    UnitPrice: 62.50,
    Quantity: 5,
    Discount: 0.05
  }
]);

db.OrdersInfo.insertOne({
  OrderID: newOrderId,
  Customer: {
    CustomerID: "ALFKI",
    CompanyName: "Alfreds Futterkiste",
    City: "Berlin",
    Country: "Germany"
  },
  Employee: {
    EmployeeID: 5,
    FirstName: "Steven",
    LastName: "Buchanan",
    Title: "Sales Manager"
  },
  Dates: {
    OrderDate: ISODate("2025-04-16T00:00:00Z"),
    RequiredDate: ISODate("2025-05-16T00:00:00Z")
  },
  Orderdetails: [
    {
      UnitPrice: 18.00,
      Quantity: 10,
      Discount: 0,
      Value: 180.00,
      product: {
        ProductID: 1,
        ProductName: "Chai",
        QuantityPerUnit: "10 boxes x 20 bags",
        CategoryID: 1,
        CategoryName: "Beverages"
      }
    },
    {
      UnitPrice: 62.50,
      Quantity: 5,
      Discount: 0.05,
      Value: 296.875,
      product: {
        ProductID: 31,
        ProductName: "Ikura",
        QuantityPerUnit: "12 - 200 g jars",
        CategoryID: 8,
        CategoryName: "Seafood"
      }
    }
  ],
  Freight: 15.00,
  OrderTotal: 476.875,
  Shipment: {
    Shipper: { ShipperID: 3, CompanyName: "Federal Shipping" },
    ShipName: "Alfreds Futterkiste",
    ShipAddress: "Obere Str. 57",
    ShipCity: "Berlin",
    ShipCountry: "Germany"
  }
});

 db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI" },
  {
    $push: {
      Orders: {
        OrderID: newOrderId,
        Dates: { OrderDate: ISODate("2025-04-16T00:00:00Z"), RequiredDate: ISODate("2025-05-16T00:00:00Z") },
        Employee: { EmployeeID: 5, FirstName: "Steven", LastName: "Buchanan", Title: "Sales Manager" },
        Freight: 15.00,
        OrderTotal: 476.875,
        Shipment: { Shipper: { ShipperID: 3, CompanyName: "Federal Shipping" }, ShipName: "Alfreds Futterkiste", ShipAddress: "Obere Str. 57", ShipCity: "Berlin", ShipCountry: "Germany" },
        Orderdetails: [
          { UnitPrice: 18.00, Quantity: 10, Discount: 0, Value: 180.00, product: { ProductID: 1, ProductName: "Chai", QuantityPerUnit: "10 boxes x 20 bags", CategoryID: 1, CategoryName: "Beverages" } },
          { UnitPrice: 62.50, Quantity: 5, Discount: 0.05, Value: 296.875, product: { ProductID: 31, ProductName: "Ikura", QuantityPerUnit: "12 - 200 g jars", CategoryID: 8, CategoryName: "Seafood" } }
        ]
      }
    }
  }
);