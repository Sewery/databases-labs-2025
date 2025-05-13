//zad 2

// MODEL 1 - ZNORMALIZOWANE KOLEKCJE

// Company1
db.createCollection("Company1", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "address"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string", description: "string required" },
        address: { bsonType: "string", description: "string required" },
      },
    },
  },
});

// Person1
db.createCollection("Person1", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstname", "lastname"],
      properties: {
        _id: { bsonType: "objectId" },
        firstname: { bsonType: "string", description: "string required" },
        lastname: { bsonType: "string", description: "string required" },
      },
    },
  },
});

// Trip1
db.createCollection("Trip1", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "destination", "date", "max_places", "companyId"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string", description: "string required" },
        destination: { bsonType: "string", description: "string required" },
        date: { bsonType: "date", description: "date required" },
        max_places: {
          bsonType: "int",
          minimum: 1,
          description: "int>=1 required",
        },
        companyId: {
          bsonType: "objectId",
          description: "fkey to Company1._id",
        },
      },
    },
  },
});

// Rating1
db.createCollection("Rating1", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tripId", "personId", "rating"],
      properties: {
        _id: { bsonType: "objectId" },
        tripId: { bsonType: "objectId", description: "fkey to Trip1._id" },
        personId: { bsonType: "objectId", description: "fkey to Person1._id" },
        rating: { bsonType: "int", minimum: 1, maximum: 5 },
      },
    },
  },
});

// Reservation1
db.createCollection("Reservation1", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tripId", "personId", "no_tickets"],
      properties: {
        _id: { bsonType: "objectId" },
        tripId: { bsonType: "objectId", description: "fkey to Trip1._id" },
        personId: { bsonType: "objectId", description: "fkey to Person1._id" },
        no_tickets: { bsonType: "int", minimum: 1 },
      },
    },
  },
});

// 2) Generacja przykładowych danych

// a) Company1
const companyIds = db.Company1.insertMany([
  { name: "TravelCo", address: "ul. Podróżnicza 10, Warszawa" },
  { name: "AdventureTime", address: "ul. Wyprawowa 5, Kraków" },
]).insertedIds;

// b) Trip1
const tData = [
  {
    name: "Mazury Tour",
    destination: "Mazury",
    date: ISODate("2025-03-10"),
    max_places: 20,
    companyId: companyIds[0],
  },
  {
    name: "Tatry Hike",
    destination: "Tatry",
    date: ISODate("2025-07-15"),
    max_places: 15,
    companyId: companyIds[0],
  },
  {
    name: "City Break",
    destination: "Wrocław",
    date: ISODate("2025-05-20"),
    max_places: 25,
    companyId: companyIds[1],
  },
];
let tripIds = db.Trip1.insertMany(tData).insertedIds;

// c) Person1
let personIds = db.Person1.insertMany([
  { firstname: "Anna", lastname: "Kowalska" },
  { firstname: "Piotr", lastname: "Nowak" },
  { firstname: "Ewa", lastname: "Wiśniewska" },
]).insertedIds;

// d) Rating1
db.Rating1.insertMany([
  { tripId: tripIds[0], personId: personIds[0], rating: 5 },
  { tripId: tripIds[0], personId: personIds[1], rating: 4 },
]);

// e) Reservation1
db.Reservation1.insertMany([
  { tripId: tripIds[0], personId: personIds[0], no_tickets: 2 },
  { tripId: tripIds[1], personId: personIds[1], no_tickets: 1 },
]);

//model 1 wady i zalety, wady występują przy próbie agregacji danych dla osoby lub wycieczki ponieważ wymaga to lookupów i złożonych zapytań, natomiast aktualizacja danych jest szybka i prosta
// ZAPYTANIA DLA OBECNEGO MODELU

// 1. Pobranie wszystkich rezerwacji dla konkretnej osoby wraz z danymi o wycieczkach
const personId = ObjectId(personIds[0]);
db.Reservation1.aggregate([
  { $match: { personId } },
  {
    $lookup: {
      from: "Trip1",
      localField: "tripId",
      foreignField: "_id",
      as: "trip",
    },
  },
  { $unwind: "$trip" },
  {
    $lookup: {
      from: "Rating1",
      let: { personId: "$personId", tripId: "$tripId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$personId", "$$personId"] },
                { $eq: ["$tripId", "$$tripId"] },
              ],
            },
          },
        },
      ],
      as: "rating",
    },
  },
  { $unwind: { path: "$rating", preserveNullAndEmptyArrays: true } },
]);

// 2. Pobranie wszystkich rezerwacji dla konkretnej wycieczki wraz z danymi o osobach
const tripId = ObjectId(tripIds[0]);
db.Reservation1.aggregate([
  { $match: { tripId } },
  {
    $lookup: {
      from: "Person1",
      localField: "personId",
      foreignField: "_id",
      as: "person",
    },
  },
  { $unwind: "$person" },
  {
    $lookup: {
      from: "Rating1",
      let: { personId: "$personId", tripId: "$tripId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$personId", "$$personId"] },
                { $eq: ["$tripId", "$$tripId"] },
              ],
            },
          },
        },
      ],
      as: "rating",
    },
  },
  { $unwind: { path: "$rating", preserveNullAndEmptyArrays: true } },
]);

// 3. Statystyki dla wycieczki – liczba rezerwacji, średnia ocena, dostępne miejsca
db.Trip1.aggregate([
  { $match: { _id: tripId } },
  {
    $lookup: {
      from: "Reservation1",
      localField: "_id",
      foreignField: "tripId",
      as: "reservations",
    },
  },
  {
    $lookup: {
      from: "Rating1",
      localField: "_id",
      foreignField: "tripId",
      as: "ratings",
    },
  },
  {
    $project: {
      name: 1,
      destination: 1,
      date: 1,
      companyId: 1,
      totalReservations: { $size: "$reservations" },
      totalTickets: { $sum: "$reservations.no_tickets" },
      averageRating: { $avg: "$ratings.rating" },
      availablePlaces: {
        $subtract: ["$max_places", { $sum: "$reservations.no_tickets" }],
      },
    },
  },
]);

// 4. Aktualizacja rezerwacji – prostota modyfikacji
const reservationId = db.Reservation1.findOne()._id;
db.Reservation1.updateOne({ _id: reservationId }, { $set: { no_tickets: 3 } });

// 5. Aktualizacja oceny
db.Rating1.updateOne({ personId, tripId }, { $set: { rating: 4 } });

// MODEL 2 - 



// MODEL 3 Z ZAGNIEŻDŻONYMI TABLICAMI

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

// PRZYGOTOWANIE DANYCH DLA MODELU 3 - WYPEŁNIANIE

// a) Wstawiamy Company3
const companyInsert = db.Company3.insertMany([
  {
    name: "TravelCo",
    address: "ul. Podróżnicza 10, Warszawa",
    trips: [],
  },
  {
    name: "AdventureTime",
    address: "ul. Wyprawowa 5, Kraków",
    trips: [],
  },
]);
const [comp1Id, comp2Id] = Object.values(companyInsert.insertedIds);

// b) Wstawiamy Trip3 i zbieramy ich _id
const trips = [
  {
    name: "Mazury Tour",
    destination: "Mazury",
    date: ISODate("2025-03-10"),
    max_places: 20,
    companyId: comp1Id,
  },
  {
    name: "Tatry Hike",
    destination: "Tatry",
    date: ISODate("2025-07-15"),
    max_places: 15,
    companyId: comp1Id,
  },
  {
    name: "City Break",
    destination: "Wrocław",
    date: ISODate("2025-05-20"),
    max_places: 25,
    companyId: comp2Id,
  },
];
const tripInsert = db.Trip3.insertMany(trips);
const [trip1Id, trip2Id, trip3Id] = Object.values(tripInsert.insertedIds);

// c) Zaktualizuj Company3.trips, aby wstawić tripId
db.Company3.updateOne(
  { _id: comp1Id },
  {
    $set: {
      trips: [
        {
          tripId: trip1Id,
          name: "Mazury Tour",
          destination: "Mazury",
          date: ISODate("2025-03-10"),
          max_places: 20,
        },
        {
          tripId: trip2Id,
          name: "Tatry Hike",
          destination: "Tatry",
          date: ISODate("2025-07-15"),
          max_places: 15,
        },
      ],
    },
  }
);
db.Company3.updateOne(
  { _id: comp2Id },
  {
    $set: {
      trips: [
        {
          tripId: trip3Id,
          name: "City Break",
          destination: "Wrocław",
          date: ISODate("2025-05-20"),
          max_places: 25,
        },
      ],
    },
  }
);

// d) Wstawiamy Person3
db.Person3.insertMany([
  { firstname: "Anna", lastname: "Kowalska", reservations: [] },
  { firstname: "Piotr", lastname: "Nowak", reservations: [] },
  { firstname: "Ewa", lastname: "Wiśniewska", reservations: [] },
]);
const personInsert = db.Person3.find().limit(3).toArray();
const [p1, p2, p3] = personInsert;

// e) Wstawiamy Reservation3 i aktualizujemy Person3.reservations
const res1 = db.Reservation3.insertOne({
  personId: p1._id,
  tripId: trip1Id,
  no_tickets: 2,
});
const res2 = db.Reservation3.insertOne({
  personId: p2._id,
  tripId: trip1Id,
  no_tickets: 1,
});

// Aktualizujemy reservations dla Person3
[res1, res2].forEach(({ insertedId, ops }, idx) => {
  const r = ops[0];
  const person = idx === 0 ? p1 : p2;
  const trip = idx === 0 ? trips[0] : trips[0];
  db.Person3.updateOne(
    { _id: person._id },
    {
      $push: {
        reservations: {
          reservationId: insertedId,
          tripId: r.tripId,
          name: trip.name,
          destination: trip.destination,
          date: trip.date,
          no_tickets: r.no_tickets,
          rating: null,
          companyId: r.companyId,
          companyName: r.companyId.equals(comp1Id)
            ? "TravelCo"
            : "AdventureTime",
        },
      },
    }
  );
});

// f) Wstawiamy ratings dla Trip3
db.Trip3.updateOne(
  { _id: trip1Id },
  {
    $push: {
      ratings: [
        {
          personId: p1._id,
          firstname: p1.firstname,
          lastname: p1.lastname,
          rating: 5,
        },
        {
          personId: p2._id,
          firstname: p2.firstname,
          lastname: p2.lastname,
          rating: 4,
        },
      ],
    },
  }
);

// ZAPYTANIA I OPERACJE DLA MODELU 1 I MODELU 3 - PORÓWNANIE

// 1.1. Pobranie wszystkich wycieczek dla firmy o _id = comp1Id (Model1 - znormalizowany)
const comp1Id = db.Company1.findOne()._id;
db.Company1.aggregate([
  { $match: { _id: comp1Id } },
  {
    $lookup: {
      from: "Trip1",
      localField: "_id",
      foreignField: "companyId",
      as: "trips",
    },
  },
]);

// 3.1. Pobranie wszystkich wycieczek dla firmy o _id = comp1Id (Model3 - zagnieżdżony)
const comp3Id = db.Company3.findOne()._id;
db.Company3.findOne({ _id: comp3Id }, { _id: 0, name: 1, trips: 1 });

// 1.2. Pobranie informacji o rezerwacjach osoby (_id = person1) wraz z danymi o wycieczkach i ocenach (Model1)
const person1 = db.Person1Id.findOne()._id;
db.Person1.aggregate([
  { $match: { _id: person1 } },
  {
    $lookup: {
      from: "Reservation1",
      localField: "_id",
      foreignField: "personId",
      as: "reservations",
    },
  },
  { $unwind: "$reservations" },
  {
    $lookup: {
      from: "Trip1",
      localField: "reservations.tripId",
      foreignField: "_id",
      as: "trip",
    },
  },
  { $unwind: "$trip" },
  {
    $lookup: {
      from: "Rating1",
      let: { tid: "$trip._id", pid: "$ _id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$tripId", "$$tid"] },
                { $eq: ["$personId", "$$pid"] },
              ],
            },
          },
        },
      ],
      as: "rating",
    },
  },
  {
    $project: {
      _id: 0,
      firstname: 1,
      lastname: 1,
      trip_details: {
        tripId: "$trip._id",
        name: "$trip.name",
        destination: "$trip.destination",
        date: "$trip.date",
        no_tickets: "$reservations.no_tickets",
        rating: { $arrayElemAt: ["$rating.rating", 0] },
      },
    },
  },
]);

// 3.2. Pobranie informacji o rezerwacjach osoby (_id = person1) wraz z danymi o wycieczkach (Model3)
const person3Id = db.Person3.findOne()._id;
db.Person3.findOne(
  { _id: person3Id },
  { _id: 0, firstname: 1, lastname: 1, reservations: 1 }
);

// 1.3. Dodanie nowej rezerwacji (Model1)
const trip1Id = db.Trip1.findOne()._id;
const newRes = db.Reservation1.insertOne({
  personId: person1Id,
  tripId: trip1Id,
  no_tickets: 2,
});

// 3.3. Dodanie nowej rezerwacji (Model3):
// a) do kolekcji rezerwacji
const trip3Id = db.Trip3.findOne()._id;
const res3 = db.Reservation3.insertOne({
  personId: person1,
  tripId: trip3Id,
  no_tickets: 2,
});
// b) aktualizacja Person3.reservations
const tripInfo = db.Trip3.findOne({ _id: trip3Id });
const compInfo = db.Company3.findOne({ _id: tripInfo.companyId });

db.Person3.updateOne(
  { _id: person1 },
  {
    $push: {
      reservations: {
        reservationId: res3.insertedId,
        tripId: tripInfo._id,
        name: tripInfo.name,
        destination: tripInfo.destination,
        date: tripInfo.date,
        no_tickets: 2,
        rating: null,
        companyId: tripInfo.companyId,
        companyName: compInfo.name,
      },
    },
  }
);

// c) aktualizacja available_places w Trip3
const allRes = db.Reservation3.find({ tripId: tripInfo._id }).toArray();
const totalTickets = allRes.reduce((sum, r) => sum + r.no_tickets, 0);
db.Trip3.updateOne(
  { _id: tripInfo._id },
  { $set: { available_places: tripInfo.max_places - totalTickets } }
);

// 1.4. Zmiana liczby biletów w rezerwacji (Model1)
db.Reservation1.updateOne(
  { _id: newRes.insertedId },
  { $set: { no_tickets: 3 } }
);

// 3.4. Zmiana liczby biletów w rezerwacji (Model3)
db.Reservation3.updateOne(
  { _id: res3.insertedId },
  { $set: { no_tickets: 3 } }
);
// Aktualizacja zagnieżdżonego reservation w Person3:
db.Person3.updateOne(
  { _id: person1, "reservations.reservationId": res3.insertedId },
  { $set: { "reservations.$.no_tickets": 3 } }
);

// 1.5. Obliczenie średniej oceny dla wycieczki (Model1)
db.Rating1.aggregate([
  { $match: { tripId: trip1Id } },
  { $group: { _id: "$tripId", avg_rating: { $avg: "$rating" } } },
]);

// 3.5. Pobranie average_rating z Trip3 (Model3)
db.Trip3.findOne({ _id: trip3Id }, { _id: 0, name: 1, average_rating: 1 });

// 1.6. Wyszukiwanie wycieczek według kryteriów (Model1)
db.Trip1.find({ destination: "Mazury", date: { $gte: ISODate("2025-01-01") } });

// 3.6. Wyszukiwanie (Model3)
db.Trip3.find({ destination: "Mazury", date: { $gte: ISODate("2025-01-01") } });
// lub w Company3:
db.Company3.find({
  "trips.destination": "Mazury",
  "trips.date": { $gte: ISODate("2025-01-01") },
});

// 1.7. Aktualizacja firmy (Model1)
db.Company1.updateOne(
  { _id: comp1Id },
  { $set: { address: "ul. Nowa 15, Warszawa" } }
);
// 3.7. Aktualizacja firmy (Model3)
db.Company3.updateOne(
  { _id: comp1Id },
  { $set: { address: "ul. Nowa 15, Warszawa" } }
);

// 1.8. Wyszukiwanie osób, które zarezerwowały konkretne tripId (Model1)
db.Person1.aggregate([
  {
    $lookup: {
      from: "Reservation1",
      localField: "_id",
      foreignField: "personId",
      as: "reservations",
    },
  },
  { $match: { "reservations.tripId": trip1Id } },
  { $project: { _id: 0, firstname: 1, lastname: 1 } },
]);

// 3.8. Wyszukiwanie osób (Model3)
db.Person3.find(
  { "reservations.tripId": trip3Id },
  { _id: 0, firstname: 1, lastname: 1 }
);
