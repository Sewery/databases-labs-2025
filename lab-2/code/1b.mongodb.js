db.createCollection("CustomerInfo", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "CustomerID",
          "CompanyName",
          "City",
          "Country",
          "Orders"
        ],
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
          },
          "Orders": {
            bsonType: "array",
            description: "array required",
            items: {
              bsonType: "object",
              properties: {
                "OrderID": {
                  bsonType: "int",
                  description: "int required"
                },
                "Employee": {
                  bsonType: "object",
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
                  properties: {
                    "Shipper": {
                      bsonType: "object",
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
          }
        }
      }
    },
  });

db.customers.aggregate([
  {
    $lookup: {
      from: "OrdersInfo",
      localField: "CustomerID",
      foreignField: "Customer.CustomerID",
      as: "OrdersInfo"
    }
  },
  {
    $unwind: {
      path: "$OrdersInfo",
      preserveNullAndEmptyArrays: true
    }
    },

  {
    $group: {
      _id: "$CustomerID",
      CustomerID: { $first: "$CustomerID" },
      CompanyName: { $first: "$CompanyName" },
      City:        { $first: "$City" },
      Country:     { $first: "$Country" },
      Orders: {
        $push: {
          OrderID:      "$OrdersInfo.OrderID",
          Dates:        "$OrdersInfo.Dates",
          Employee:     "$OrdersInfo.Employee",
          Freight:      "$OrdersInfo.Freight",
          OrderTotal:   "$OrdersInfo.OrderTotal",
          Shipment:     "$OrdersInfo.Shipment",
          Orderdetails: "$OrdersInfo.Orderdetails"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      CustomerID: 1,
      CompanyName: 1,
      City: 1,
      Country: 1,
      Orders: 1
    }
  },

  {
    $merge: {
      into: "CustomerInfo",
    }
  }
])