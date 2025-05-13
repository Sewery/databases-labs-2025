// MODEL 2 WSZYSTKIE INFORMACJE ZAGNIEŻDŻONE
// Modele PersonInfo/TripInfo to wygodna, szybka do odczytu „fotografia” powiązanych danych.

/// TripInfo – kolekcja agregująca dane o wycieczce, firmie, rezerwacjach i ocenach zagnieżdżonych u osoby (osoby z ilością miejsc i oceną)
db.createCollection("TripInfo", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "name",
          "destination",
          "date",
          "max_places",
          "company",
          "reservations"
        ],
        properties: {
          _id: { bsonType: "objectId" },
          name: { bsonType: "string", description: "string required" },
          destination: { bsonType: "string", description: "string required" },
          date: { bsonType: "date", description: "date required" },
          max_places: {
            bsonType: "int",
            minimum: 1,
            description: "int>=1 required"
          },
          company: {
            bsonType: "object",
            required: ["_id", "name", "address"],
            properties: {
              _id: { bsonType: "objectId", description: "fkey to Company1._id" },
              name: { bsonType: "string", description: "string required" },
              address: { bsonType: "string", description: "string required" }
            }
          },
          reservations: {
            bsonType: "array",
            description: "osoby z ilością miejsc i oceną",
            items: {
              bsonType: "object",
              required: ["personId", "firstname", "lastname", "no_tickets", "rating"],
              properties: {
                personId: { bsonType: "objectId", description: "fkey to Person1._id" },
                firstname: { bsonType: "string", description: "string required" },
                lastname: { bsonType: "string", description: "string required" },
                no_tickets: { bsonType: "int", minimum: 1 },
                rating: { bsonType: ["int", "null"], minimum: 1, maximum: 5 }
              }
            }
          }
        }
      }
    }
  });
// PersonInfo – kolekcja agregująca dane o osobie, jej rezerwacjach (z podstawowymi danymi o wycieczce i firmie) oraz ocenach tej osoby
db.createCollection("PersonInfo", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "firstname",
          "lastname",
          "reservations"
        ],
        properties: {
          _id: { bsonType: "objectId" },
          firstname: { bsonType: "string", description: "string required" },
          lastname: { bsonType: "string", description: "string required" },
          reservations: {
            bsonType: "array",
            description: "rezerwacje osoby z danymi o wycieczce, firmie i oceną",
            items: {
              bsonType: "object",
              required: [
                "tripId",
                "name",
                "destination",
                "date",
                "company",
                "no_tickets",
                "rating"
              ],
              properties: {
                tripId: { bsonType: "objectId", description: "fkey to Trip1._id" },
                name: { bsonType: "string", description: "string required" },
                destination: { bsonType: "string", description: "string required" },
                date: { bsonType: "date", description: "date required" },
                company: {
                  bsonType: "object",
                  required: ["_id", "name", "address"],
                  properties: {
                    _id: { bsonType: "objectId", description: "fkey to Company1._id" },
                    name: { bsonType: "string", description: "string required" },
                    address: { bsonType: "string", description: "string required" }
                  }
                },
                no_tickets: { bsonType: "int", minimum: 1 },
                rating: { bsonType: ["int", "null"], minimum: 1, maximum: 5 }
              }
            }
          }
        }
      }
    }
  });
//b) wypełnienie kolekcji PersonInfo danymi z modelu 1
  db.Person1.aggregate([
    {
      $lookup: {
        from: "Reservation1",
        localField: "_id",
        foreignField: "personId",
        as: "reservations"
      }
    },
    {
      $lookup: {
        from: "Trip1",
        localField: "reservations.tripId",
        foreignField: "_id",
        as: "trips"
      }
    },
    {
      $lookup: {
        from: "Company1",
        localField: "trips.companyId",
        foreignField: "_id",
        as: "companies"
      }
    },
    {
      $lookup: {
        from: "Rating1",
        localField: "_id",
        foreignField: "personId",
        as: "ratings"
      }
    },
    {
      $addFields: {
        reservations: {
          $map: {
            input: "$reservations",
            as: "res",
            in: {
              tripId: "$$res.tripId",
              no_tickets: "$$res.no_tickets",
              // Pobierz dane o wycieczce
              name: {
                $arrayElemAt: [
                  "$trips.name",
                  { $indexOfArray: ["$trips._id", "$$res.tripId"] }
                ]
              },
              destination: {
                $arrayElemAt: [
                  "$trips.destination",
                  { $indexOfArray: ["$trips._id", "$$res.tripId"] }
                ]
              },
              date: {
                $arrayElemAt: [
                  "$trips.date",
                  { $indexOfArray: ["$trips._id", "$$res.tripId"] }
                ]
              },
              // Pobierz dane o firmie
              company: {
                _id: {
                  $arrayElemAt: [
                    "$companies._id",
                    { $indexOfArray: ["$companies._id",
                      { $arrayElemAt: [
                        "$trips.companyId",
                        { $indexOfArray: ["$trips._id", "$$res.tripId"] }
                      ]}
                    ]}
                  ]
                },
                name: {
                  $arrayElemAt: [
                    "$companies.name",
                    { $indexOfArray: ["$companies._id",
                      { $arrayElemAt: [
                        "$trips.companyId",
                        { $indexOfArray: ["$trips._id", "$$res.tripId"] }
                      ]}
                    ]}
                  ]
                },
                address: {
                  $arrayElemAt: [
                    "$companies.address",
                    { $indexOfArray: ["$companies._id",
                      { $arrayElemAt: [
                        "$trips.companyId",
                        { $indexOfArray: ["$trips._id", "$$res.tripId"] }
                      ]}
                    ]}
                  ]
                }
              },
              // Pobierz ocenę tej osoby dla tej wycieczki
              rating: {
                $arrayElemAt: [
                  "$ratings.rating",
                  { $indexOfArray: ["$ratings.tripId", "$$res.tripId"] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        firstname: 1,
        lastname: 1,
        reservations: 1
      }
    },
    { $merge: { into: "PersonInfo" } }
  ]);
//wypełnienie kolekcji TripInfo danymi z modelu 1
db.Trip1.aggregate([
    {
      $lookup: {
        from: "Company1",
        localField: "companyId",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: "$company" },
    {
      $lookup: {
        from: "Reservation1",
        localField: "_id",
        foreignField: "tripId",
        as: "reservations"
      }
    },
    {
      $lookup: {
        from: "Person1",
        localField: "reservations.personId",
        foreignField: "_id",
        as: "persons"
      }
    },
    {
      $lookup: {
        from: "Rating1",
        localField: "_id",
        foreignField: "tripId",
        as: "ratings"
      }
    },
    {
      $addFields: {
        reservations: {
          $map: {
            input: "$reservations",
            as: "res",
            in: {
              personId: "$$res.personId",
              no_tickets: "$$res.no_tickets",
              firstname: {
                $arrayElemAt: [
                  "$persons.firstname",
                  { $indexOfArray: ["$persons._id", "$$res.personId"] }
                ]
              },
              lastname: {
                $arrayElemAt: [
                  "$persons.lastname",
                  { $indexOfArray: ["$persons._id", "$$res.personId"] }
                ]
              },
              rating: {
                $ifNull: [
                    {
                      $arrayElemAt: [
                        "$ratings.rating",
                        { $indexOfArray: ["$ratings.tripId", "$$res.tripId"] }
                      ]
                    },
                    null
                  ]
              }
          }
        }
      }
      }
    },
    {
      $project: {
        name: 1,
        destination: 1,
        date: 1,
        max_places: 1,
        company: {
          _id: "$company._id",
          name: "$company.name",
          address: "$company.address"
        },
        reservations: 1
      }
    },
    { $merge: { into: "TripInfo", whenMatched: "replace", whenNotMatched: "insert" } }
  ]);  
//c) 
// Wyświetl wszystkie wycieczki, które dana osoba oceniła na 5
db.PersonInfo.aggregate([
    { $match: { firstname: "Anna", lastname: "Kowalska" } },
    { $unwind: "$reservations" },
    { $match: { "reservations.rating": 5 } },
    { $project: { "reservations.name": 1, "reservations.destination": 1, "reservations.company.name": 1, "reservations.rating": 1, _id: 0 } }
  ])
// Policz ile rezerwacji ma dana osoba
db.PersonInfo.aggregate([
    { $match: { firstname: "Anna", lastname: "Kowalska" } },
    { $project: { liczba_rezerwacji: { $size: "$reservations" } } }
  ])
//Wyszukaj wycieczki, gdzie ktoś zarezerwował więcej niż 1 miejsce
db.TripInfo.find(
    { "reservations.no_tickets": { $gt: 1 } },
    { name: 1, "reservations.$": 1 }
  )
//Wyszukaj wycieczki,które odbyły się w marcu 2025 roku i zostały zorganizowane przez firmę TravelCo
db.TripInfo.find(
    {
      "company.name": "TravelCo",
      date: {
        $gte: ISODate("2025-03-01T00:00:00Z"),
        $lt: ISODate("2025-04-01T00:00:00Z")
      }
    },
    {
      reservations: 0
    }
)