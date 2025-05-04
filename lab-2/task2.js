//zad 2 model 1 i generacja danych

db.createCollection("Company", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id","name","address"],
      properties: {
        id:        { bsonType: "int",    description: "must be int and is required" },
        name:      { bsonType: "string", description: "must be string and is required" },
        address:   { bsonType: "string", description: "must be string and is required" }
      }
    }
  }
});

db.createCollection("Person", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id","firstname","lastname"],
      properties: {
        id:        { bsonType: "int",    description: "must be int and is required" },
        firstname:{ bsonType: "string", description: "must be string and is required" },
        lastname: { bsonType: "string", description: "must be string and is required" }
      }
    }
  }
});

db.createCollection("Trip", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id","name","destination","date","max_places","companyid"],
      properties: {
        id:           { bsonType: "int",    description: "int required" },
        name:         { bsonType: "string", description: "string required" },
        destination:  { bsonType: "string", description: "string required" },
        date:         { bsonType: "date",   description: "date required" },
        max_places:   { bsonType: "int",    minimum:1   description: "int required" },
        companyid:    { bsonType: "int",    description: "int required" }
      }
    }
  }
});

db.createCollection("Rating", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id","trip_id","person_id","rating"],
      properties: {
        id:        { bsonType: "int",    description: "int required" },
        trip_id:   { bsonType: "int",    description: "int required" },
        person_id: { bsonType: "int",    description: "int required" },
        rating:    { bsonType: "int",    minimum: 1, maximum: 5, description: "int 1–5 required" }
      }
    }
  }
});

db.createCollection("Reservation", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id","person_id","trip_id","no_tickets"],
      properties: {
        id:         { bsonType: "int", description: "int required" },
        person_id:  { bsonType: "int", description: "int required" },
        trip_id:    { bsonType: "int", description: "int required" },
        no_tickets: { bsonType: "int", minimum: 1, description: "int ≥1 required" }
      }
    }
  }
});


const companies = [
  { id: 1, name: "TravelCo", address: "ul. Podróżnicza 10, Warszawa" },
  { id: 2, name: "AdventureTime", address: "ul. Wyprawowa 5, Kraków" }
];
db.Company.insertMany(companies);

const trips = [
  { id: 1, name: "Mazury Tour", destination: "Mazury", date: ISODate("2025-03-10"), max_places: 20, companyid: 1 },
  { id: 2, name: "Tatry Hike", destination: "Tatry", date: ISODate("2025-07-15"), max_places: 15, companyid: 1 },
  { id: 3, name: "Wrocław City Break", destination: "Wrocław", date: ISODate("2025-05-20"), max_places: 25, companyid: 2 },
  { id: 4, name: "Baltic Relax", destination: "Morze Bałtyckie", date: ISODate("2025-08-05"), max_places: 30, companyid: 2 }
];
db.Trip.insertMany(trips);

const persons = [
  { id: 1, firstname: "Anna", lastname: "Kowalska" },
  { id: 2, firstname: "Piotr", lastname: "Nowak" },
  { id: 3, firstname: "Ewa", lastname: "Wiśniewska" },
  { id: 4, firstname: "Marek", lastname: "Zieliński" },
  { id: 5, firstname: "Katarzyna", lastname: "Woźniak" }
];
db.Person.insertMany(persons);

const ratings = [
  { id: 1, trip_id: 1, person_id: 1, rating: 5 },
  { id: 2, trip_id: 1, person_id: 2, rating: 4 },
  { id: 3, trip_id: 3, person_id: 3, rating: 5 },
  { id: 4, trip_id: 4, person_id: 4, rating: 3 }
];
db.Rating.insertMany(ratings);

const reservations = [
  { id: 1, person_id: 1, trip_id: 1, no_tickets: 2 },
  { id: 2, person_id: 2, trip_id: 1, no_tickets: 1 },
  { id: 3, person_id: 3, trip_id: 2, no_tickets: 3 },
  { id: 4, person_id: 4, trip_id: 3, no_tickets: 2 },
  { id: 5, person_id: 5, trip_id: 4, no_tickets: 4 },
  { id: 6, person_id: 1, trip_id: 3, no_tickets: 1 }
];
db.Reservation.insertMany(reservations);