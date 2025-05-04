db.createCollection("OrdersInfo",{
    validator:{
        jsonSchema:{
            bsonType:"object",
            required: [],
            properties: {
                    "OrderID": {
                      bsonType: "int",
                      description: "int required"
                    },
                    "Customer": {
                      bsonType: "object",
                      required: ["CustomerID", "CompanyName", "City", "Country"],
                      properties: {
                        "CustomerID": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "CompanyName": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "City": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "Country": {
                          bsonType: "string",
                          description: "string required"
                        }
                      }
                    },
                    "Employee": {
                      bsonType: "object",
                      required: ["EmployeeID", "FirstName", "LastName", "Title"],
                      properties: {
                        "EmployeeID": {
                          bsonType: "int",
                          description: "int required"
                        },
                        "FirstName": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "LastName": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "Title": {
                          bsonType: "string",
                          description: "string required"
                        }
                      }
                    },
                    "Dates": {
                      bsonType: "object",
                      required: ["OrderDate", "RequiredDate"],
                      properties: {
                        "OrderDate": {
                          bsonType: "date",
                          description: "date required"
                        },
                        "RequiredDate": {
                          bsonType: "date",
                          description: "date required"
                        }
                      }
                    },
                    "Orderdetails": {
                      bsonType: "array",
                      items: {
                        bsonType: "object",
                        required: [],
                        properties: {
                          "UnitPrice": {
                            bsonType: "double",
                            description: "double required"
                          },
                          "Quantity": {
                            bsonType: "int",
                            description: "int required"
                          },
                          "Discount": {
                            bsonType: "double",
                            description: "double required"
                          },
                          "Value": {
                            bsonType: "double",
                            description: "double required"
                          },
                          "product": {
                            bsonType: "object",
                            required: [],
                            properties: {
                              "ProductID": {
                                bsonType: "int",
                                description: "int required"
                              },
                              "ProductName": {
                                bsonType: "string",
                                description: "string required"
                              },
                              "QuantityPerUnit": {
                                bsonType: "string",
                                description: "string required"
                              },
                              "CategoryID": {
                                bsonType: "int",
                                description: "int required"
                              },
                              "CategoryName": {
                                bsonType: "string",
                                description: "string required"
                              }
                            }
                          }
                        }
                      }
                    },
                    "Freight": {
                      bsonType: "double",
                      description: "double required"
                    },
                    "OrderTotal": {
                      bsonType: "double",
                      description: "double required"
                    },
                    "Shipment": {
                      bsonType: "object",
                      required: [],
                      properties: {
                        "Shipper": {
                          bsonType: "object",
                          required: ["ShipperID", "CompanyName"],
                          properties: {
                            "ShipperID": {
                              bsonType: "int",
                              description: "int required"
                            },
                            "CompanyName": {
                              bsonType: "string",
                              description: "string required"
                            }
                          }
                        },
                        "ShipName": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "ShipAddress": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "ShipCity": {
                          bsonType: "string",
                          description: "string required"
                        },
                        "ShipCountry": {
                          bsonType: "string",
                          description: "string required"
                        }
                      }
                    }
                  }
                }
              },
        }

)
use north0;
db.orderdetails.aggregate([
  {
     $match: {}
  },
  {
    $lookup: {
      from: "products",
      localField: "ProductID",
      foreignField: "ProductID",
      as: "products"
    }
  },
  {
    $unwind: "$products"
  },
   {
    $lookup: {
      from: "categories",
      localField: "products.CategoryID",
      foreignField: "CategoryID",
      as: "categories"
    }
   },
    {
         $unwind: "$categories"
    },
  {
      $addFields: {
          Value: { $multiply: ["$UnitPrice", "$Quantity", { $subtract: [1, "$Discount"] }] },
          product: {
              ProductID:"$products.ProductID",
              ProductName:"$products.ProductName",
              QuantityPerUnit: "$products.QuantityPerUnit",
              CategoryID: "$products.CategoryID",
              CategoryName: "$categories.CategoryName",
          }
      }
   },
   {
    $project:{
         "_id":0,
        "products":0,
        "categories":0,
    }
   },
   {
    $out:"orderdetails_tmp"
   }

])

db.orders.aggregate([
{
  $match: {}
},
//customers
{
  $lookup: {
    from: "customers",
    localField: "CustomerID",
    foreignField: "CustomerID",
    as: "Customer"
  }
},
{
  $unwind: "$Customer"
},
{
    $project : {
        "Customer._id": 0,
        "Customer.ContactName": 0,
        "Customer.ContactTitle": 0,
        // "Customer.City": 0,
        // "Customer.Country": 0,
        "Customer.Address": 0,
        "Customer.PostalCode": 0,
        "Customer.Region": 0,
        "Customer.Phone": 0,
        "Customer.Fax": 0
       }
},
//employees
{
  $lookup: {
    from: "employees",
    localField: "EmployeeID",
    foreignField: "EmployeeID",
    as: "Employee"
  }
},
 {
    $unwind: "$Employee"
  },
{
    $project : {
        "Employee._id": 0,
        //"Employee.Title": 0,
        "Employee.TitleOfCourtesy": 0,
        "Employee.BirthDate": 0,
        "Employee.HireDate": 0,
        "Employee.Address": 0,
        "Employee.PostalCode": 0,
        "Employee.City": 0,
        "Employee.Region": 0,
        "Employee.Country": 0,
        "Employee.HomePhone": 0,
        "Employee.Extension": 0,
        "Employee.Photo": 0,
        "Employee.Notes": 0,
        "Employee.ReportsTo": 0,
        "Employee.PhotoPath": 0
    }
},
//Dates
{
    $addFields: {
        Dates: {
            OrderDate: "$OrderDate",
            RequiredDate: "$RequiredDate",

        }
    }
},
//Orderdetails
{
  $lookup : {
      from: "orderdetails_tmp",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "Orderdetails"
  }
},
{
  $project : {
      "Orderdetails.OrderID": 0,
      "Orderdetails._id": 0
  }
},
 //Shippers
 {
    $lookup : {
        from: "shippers",
        localField: "ShipVia",
        foreignField: "ShipperID",
        as: "shippers"
    }
  },
{
  $unwind:"$shippers"
},

 {
    $addFields: {
     Freight: "$Freight",
      OrderTotal: {
           $sum: "$orderdetails.Value"
      },
      Shipment:{
          Shipper:{
             ShipperID:"$shippers.ShipperID",
             CompanyName:"$shippers.CompanyName",
          },
          ShipName:"$ShipName" ,
          ShipAddress:"$ShipAddress" ,
          ShipCity: "$ShipCity" ,
          ShipCountry:"$ShipCountry"
          }
      }

 },
{
  $project: {
    _id: 0,
    shippers: 0,
    "CustomerID":0,
    "EmployeeID":0,
    "OrderDate":0,
    "RequiredDate":0,
    "ShipAddress":0,
    "ShipCity":0,
    "ShipCountry":0,
    "ShipName":0,
    "ShipPostalCode":0,
    "ShipRegion":0,
    "ShipVia":0,
    "ShippedDate":0
  }
},
{
  $out:"OrdersInfo"
}
]);
