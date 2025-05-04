// zad 1d original
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "Orders"
    }
  },
  { $unwind: "$Orders" },
  {
    $lookup: {
      from: "orderdetails",
      localField: "Orders.OrderID",
      foreignField: "OrderID",
      as: "Orderdetails"
    }
  },
  { $unwind: "$Orderdetails" },
  {
    $group: {
      _id: {
        CustomerID: "$CustomerID",
        CompanyName: "$CompanyName",
        Year: { $year: "$Orders.OrderDate" },
        Month: { $month: "$Orders.OrderDate" }
      },
      Total: {
        $sum: {
          $multiply: [
            "$Orderdetails.UnitPrice",
            "$Orderdetails.Quantity",
            { $subtract: [1, "$Orderdetails.Discount"] }
          ]
        }
      }
    }
  },
{
  $group: {
    _id: "$_id.CustomerID",
    CompanyName: { $first: "$_id.CompanyName" },
    Sale: {
      $push: {
        Year: "$_id.Year",
        Month: "$_id.Month",
        Total: "$Total"
      }
    }
  }
},
{
  $project: {
    _id: 0,
    CustomerID: "$_id",
    CompanyName: 1,
    Sale: 1
  }
}
])
//zad 1d orderinfo
db.OrdersInfo.aggregate([

  { $unwind: "$Orderdetails" },

  { $group: {
      _id: {
        CustomerID: "$Customer.CustomerID",
        CompanyName: "$Customer.CompanyName",
        Year:  { $year:  "$Dates.OrderDate" },
        Month: { $month: "$Dates.OrderDate" }
      },
      Total: { $sum: "$Orderdetails.Value" }
    }
  },

  { $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      Sale: {
        $push: {
          Year:  "$_id.Year",
          Month: "$_id.Month",
          Total: "$Total"
        }
      }
    }
  },

  { $project: {
      _id:         0,
      CustomerID:  "$_id",
      CompanyName: 1,
      Sale:        1
    }
  }
])

//zad1d customerinfodb.CustomerInfo.aggregate([

  { $unwind: "$Orders" },
  {$unwind: "$Orders.Orderdetails"},
  { $group: {
      _id: {
        CustomerID: "$CustomerID",
        CompanyName: "$CompanyName",
        Year:  { $year:  "$Orders.Dates.OrderDate" },
        Month: { $month: "$Orders.Dates.OrderDate" }
      },
      Total: { $sum: "$Orders.Orderdetails.Value" }
    }
  },

  { $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      Sale: {
        $push: {
          Year:  "$_id.Year",
          Month: "$_id.Month",
          Total: "$Total"
        }
      }
    }
  },

  { $project: {
      _id:         0,
      CustomerID:  "$_id",
      CompanyName: 1,
      Sale:        1
    }
  }
])
