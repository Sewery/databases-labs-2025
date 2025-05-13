//Model 3

//Rozwiązanie pośrednie z zagnieżdżonymi tablicami wewnątrz oryginalnych kolekcji oraz częsciowo znormalizowane

// a) Tworzenie kolekcji Company3, Reservation3, Person3 i Trip3

// 1. Company3 – firmy z zagnieżdżonymi wycieczkami
db.createCollection("Company3", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "address", "trips"],
      properties: {
        _id: { bsonType: "objectId" },
        name: {
          bsonType: "string",
          description: "must be string and is required",
        },
        address: {
          bsonType: "string",
          description: "must be string and is required",
        },
        trips: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["name", "destination", "date", "max_places", "tripId"],
            properties: {
              tripId: {
                bsonType: "objectId",
                description: "fkey to Trip3._id",
              },
              name: { bsonType: "string" },
              destination: { bsonType: "string" },
              date: { bsonType: "date" },
              max_places: { bsonType: "int", minimum: 1 },
            },
          },
        },
      },
    },
  },
});

// 2. Trip3 – wycieczki z zagnieżdżonymi ocenami
db.createCollection("Trip3", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name",
        "destination",
        "date",
        "max_places",
        "companyId",
        "ratings",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        destination: { bsonType: "string" },
        date: { bsonType: "date" },
        max_places: { bsonType: "int", minimum: 1 },
        companyId: {
          bsonType: "objectId",
          description: "fkey to Company3._id",
        },
        available_places: { bsonType: "int" },
        number_of_ratings: { bsonType: "int" },
        average_rating: { bsonType: "double" },
        ratings: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["personId", "rating", "firstname", "lastname"],
            properties: {
              personId: {
                bsonType: "objectId",
                description: "fkey to Person3._id",
              },
              firstname: { bsonType: "string" },
              lastname: { bsonType: "string" },
              rating: { bsonType: "int", minimum: 1, maximum: 5 },
            },
          },
        },
      },
    },
  },
});

// 3. Person3 – osoby z zagnieżdżonymi rezerwacjami

db.createCollection("Person3", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstname", "lastname", "reservations"],
      properties: {
        _id: { bsonType: "objectId" },
        firstname: { bsonType: "string" },
        lastname: { bsonType: "string" },
        reservations: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: [
              "tripId",
              "reservationId",
              "no_tickets",
              "name",
              "destination",
              "date",
              "companyId",
              "companyName",
            ],
            properties: {
              name: { bsonType: "string" },
              destination: { bsonType: "string" },
              date: { bsonType: "date" },
              no_tickets: { bsonType: "int", minimum: 1 },
              rating: { bsonType: ["int", "null"], minimum: 1, maximum: 5 },
              companyName: { bsonType: "string" },
              tripId: {
                bsonType: "objectId",
                description: "fkey to Trip3._id",
              },
              reservationId: {
                bsonType: "objectId",
                description: "fkey to Reservation3._id",
              },
              companyId: {
                bsonType: "objectId",
                description: "fkey to Company3._id",
              },
            },
          },
        },
      },
    },
  },
});

// 4. Reservation3 – osobna kolekcja rezerwacji

db.createCollection("Reservation3", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["personId", "tripId", "no_tickets"],
      properties: {
        _id: { bsonType: "objectId" },
        personId: { bsonType: "objectId", description: "fkey to Person3._id" },
        tripId: { bsonType: "objectId", description: "fkey to Trip3._id" },
        no_tickets: { bsonType: "int", minimum: 1 },
      },
    },
  },
});


//b) Wypełnienie kolekcji danymi z modelu 1

// Wstawiamy firmy 

db.Company1.aggregate([
  {
    $lookup: {
      from: "Trip1",
      localField: "_id",
      foreignField: "companyId",
      as: "trips"
    }
  },
  {
    $project: {
      name: 1,
      address: 1,
      trips: {
        $map: {
          input: "$trips",
          as: "t",
          in: {
            tripId: "$$t._id",
            name: "$$t.name",
            destination: "$$t.destination",
            date: "$$t.date",
            max_places: "$$t.max_places"
          }
        }
      }
    }
  },
  { $merge: { into: "Company3" } }
]);


// Wstawiamy wycieczki do Trip3

db.Trip1.aggregate([
  {
    $lookup: {
      from: "Rating1",
      localField: "_id",
      foreignField: "tripId",
      as: "ratings"
    }
  },
  {
    $lookup: {
      from: "Person1",
      localField: "ratings.personId",
      foreignField: "_id",
      as: "persons"
    }
  },
  {
    $addFields: {
      ratings: {
        $map: {
          input: "$ratings",
          as: "r",
          in: {
            personId: "$$r.personId",
            rating: "$$r.rating",
            firstname: {
              $arrayElemAt: [
                "$persons.firstname",
                { $indexOfArray: ["$persons._id", "$$r.personId"] }
              ]
            },
            lastname: {
              $arrayElemAt: [
                "$persons.lastname",
                { $indexOfArray: ["$persons._id", "$$r.personId"] }
              ]
            }
          }
        }
      },
      number_of_ratings: { $size: "$ratings" },
      average_rating: { $cond: [
        { $gt: [ { $size: "$ratings" }, 0 ] },
        { $avg: "$ratings.rating" },
        null
      ]}
    }
  },
  {
    $project: {
      name: 1,
      destination: 1,
      date: 1,
      max_places: 1,
      companyId: 1,
      ratings: 1,
      number_of_ratings: 1,
      average_rating: 1
    }
  },
  { $merge: { into: "Trip3" } }
]);

// Wstawiamy osoby

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
            reservationId: "$$res._id",
            tripId: "$$res.tripId",
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
            no_tickets: "$$res.no_tickets",
            companyId: {
              $arrayElemAt: [
                "$trips.companyId",
                { $indexOfArray: ["$trips._id", "$$res.tripId"] }
              ]
            },
            companyName: {
              $arrayElemAt: [
                "$companies.name",
                { $indexOfArray: [
                  "$companies._id",
                  { $arrayElemAt: [
                    "$trips.companyId",
                    { $indexOfArray: ["$trips._id", "$$res.tripId"] }
                  ]}
                ]}
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
      firstname: 1,
      lastname: 1,
      reservations: 1
    }
  },
  { $merge: { into: "Person3" } }
]);
// Wstawiamy rezerwacje

db.Reservation1.aggregate([
  {
    $project: {
      personId: 1,
      tripId: 1,
      no_tickets: 1
    }
  },
  { $merge: { into: "Reservation3" } }
]);
