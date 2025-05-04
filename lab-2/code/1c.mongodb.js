
/**
 * 0. Select w sqlu
 * 
 * SELECT c.CompanyName,SUM((1-od.Discount)*od.UnitPrice*od.Quantity) as totalval
       FROM Customers c
        JOIN Orders o ON o.CustomerID=c.CustomerID
           AND YEAR(o.OrderDate)=1997
        JOIN [Order Details] od ON od.OrderID = o.OrderID
        JOIN Products p ON p.ProductID = od.ProductID
        JOIN Categories cat ON cat.CategoryID = p.CategoryID
    WHERE
        cat.CategoryName='Confections'
    GROUP BY c.CompanyName
    ORDER BY 2 DESC
    use north0;
 * 
 */


//1
db.customers.aggregate([
  {
    $match: {},
  },
  {
    $lookup: {
      from: "orders",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "orders",
    },
  },
  {
    $unwind: "$orders",
  },
  {
    $match: {
      $expr: {
        $eq: [{ $year: "$orders.OrderDate" }, 1997],
      },
    },
  },
  {
    $lookup: {
      from: "orderdetails",
      localField: "orders.OrderID",
      foreignField: "OrderID",
      as: "orderdetails",
    },
  },
  {
    $unwind: "$orderdetails",
  },
  {
    $lookup: {
      from: "products",
      localField: "orderdetails.ProductID",
      foreignField: "ProductID",
      as: "products",
    },
  },
  {
    $unwind: "$products",
  },
  {
    $lookup: {
      from: "categories",
      localField: "products.CategoryID",
      foreignField: "CategoryID",
      as: "categories",
    },
  },
  {
    $unwind: "$categories",
  },
  {
    $match: {
      "categories.CategoryName": "Confections",
    },
  },
  {
    $group: {
      _id: "$_id",
      CustomerID: { $first: "$CustomerID" },
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: {
        $sum: {
          $multiply: [
            { $subtract: [1, "$orderdetails.Discount"] },
            "$orderdetails.UnitPrice",
            "$orderdetails.Quantity",
          ],
        },
      },
    },
  },
  {
    $sort: {
      ConfectionsSale97: -1,
    },
  },
]);

//2
db.customers.aggregate([
  {
    $match: {},
  },
  {
    $lookup: {
      from: "OrdersInfo",
      localField: "CustomerID",
      foreignField: "Customer.CustomerID",
      as: "ordersinfo",
    },
  },
  {
    $unwind: "$ordersinfo",
  },
  {
    $match: {
      $expr: { $eq: [{ $year: "$ordersinfo.Dates.OrderDate" }, 1997] },
    },
  },
  {
    $unwind: "$ordersinfo.Orderdetails",
  },
  {
    $match: {
      "ordersinfo.Orderdetails.product.CategoryName": "Confections",
    },
  },
  {
    $group: {
      _id: "$_id",
      CustomerID: { $first: "$CustomerID" },
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: {
        $sum: {
          $multiply: [
            { $subtract: [1, "$ordersinfo.Orderdetails.Discount"] },
            "$ordersinfo.Orderdetails.UnitPrice",
            "$ordersinfo.Orderdetails.Quantity",
          ],
        },
      },
    },
  },
  {
    $sort: {
      ConfectionsSale97: -1,
    },
  },
]);
//3
db.customers.aggregate([
  {
    $match: {},
  },
  {
    $lookup: {
      from: "CustomerInfo",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "customerinfo",
    },
  },
  {
    $unwind: "$customerinfo",
  },
  {
    $unwind: "$customerinfo.Orders",
  },
  {
    $match: {
      $expr: { $eq: [{ $year: "$customerinfo.Orders.Dates.OrderDate" }, 1997] },
    },
  },
  {
    $unwind: "$customerinfo.Orders.Orderdetails",
  },
  {
    $match: {
      "customerinfo.Orders.Orderdetails.product.CategoryName": "Confections",
    },
  },
  {
    $group: {
      _id: "$_id",
      CustomerID: { $first: "$CustomerID" },
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: {
        $sum: {
          $multiply: [
            { $subtract: [1, "$customerinfo.Orders.Orderdetails.Discount"] },
            "$customerinfo.Orders.Orderdetails.UnitPrice",
            "$customerinfo.Orders.Orderdetails.Quantity",
          ],
        },
      },
    },
  },
  {
    $sort: {
      ConfectionsSale97: -1,
    },
  },
]);
