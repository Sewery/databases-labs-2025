const newOrderId = 12345;
//1
db.orderdetails.find(
    {
     OrderID:newOrderId
    },
).limit(2)
 db.orderdetails.updateOne(
    {
        OrderID:newOrderId,
        ProductID: 1,
    },
     {
            $inc: {"Discount": 0.05}
     }
 )
 db.orderdetails.updateOne(
     {
         OrderID:newOrderId,
            ProductID: 31,
     },
     {
        $inc: {"Discount": 0.05}
     }
  )
db.orderdetails.find(
    {
     OrderID:newOrderId
    },
).limit(2)
//2
db.OrdersInfo.find(
    {
     OrderID:newOrderId
    },
).limit(2)
   db.OrdersInfo.updateOne(
       {
           OrderID:newOrderId
       },
       [
          {
             $set: {
                Orderdetails:{
                     $map: {
                         input:"$Orderdetails",
                         as:"detail",
                         in:{
                            $mergeObjects:[
                                "$$detail",
                               {
                                 Discount: { $add: ["$$detail.Discount", 0.05] },
                                 Value: {
                                   $multiply: [
                                     "$$detail.UnitPrice",
                                     "$$detail.Quantity",
                                     { $subtract: [1, { $add: ["$$detail.Discount", 0.05] }] }
                                   ]
                                 }
                               }
                            ]
                         }
                     }
                }
             }
          },
          {
               $set: {
                  Ordertotal:{
                      $sum:"$Orderdetails.Value"
                  }
               }

          }
       ]
      )
db.OrdersInfo.find(
    {
     OrderID:newOrderId
    },
).limit(2)
//3
db.CustomerInfo.find(
    { CustomerID: "ALFKI" },
);
db.CustomerInfo.updateOne(
  {
    CustomerID: "ALFKI"
  },
  [
    {
      $set: {
        Orders: {
          $map: {
            input: "$Orders",
            as: "order",
            in: {
              $cond: {
                if: { $eq: ["$$order.OrderID", newOrderId] },
                then: {
                  $mergeObjects: [
                    "$$order",
                    {
                      Orderdetails: {
                        $map: {
                          input: "$$order.Orderdetails",
                          as: "detail",
                          in: {
                            $mergeObjects: [
                              "$$detail",
                              {
                                Discount: { $add: ["$$detail.Discount", 0.05] },
                                Value: {
                                  $multiply: [
                                    "$$detail.UnitPrice",
                                    "$$detail.Quantity",
                                    { $subtract: [1, { $add: ["$$detail.Discount", 0.05] }] }
                                  ]
                                }
                              }
                            ]
                          }
                        }
                      }
                    }
                  ]
                },
                else: "$$order"
              }
            }
          }
        }
      }
    },
    {
      $set: {
        Orders: {
          $map: {
            input: "$Orders",
            as: "order",
            in: {
              $cond: {
                if: { $eq: ["$$order.OrderID", newOrderId] },
                then: {
                  $mergeObjects: [
                    "$$order",
                    {
                      OrderTotal: { $sum: "$$order.Orderdetails.Value" }
                    }
                  ]
                },
                else: "$$order"
              }
            }
          }
        }
      }
    }
  ]
)
db.CustomerInfo.find(
    {
     CustomerID:"ALFKI"
    },
).limit(2)