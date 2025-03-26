# Labarotrium 1 - PL SQL

## Zadanie 0

```sql
ALTER TABLE RESERVATION
    ADD no_tickets int default 0 NOT NULL;
ALTER TABLE LOG
    ADD no_tickets int default 0 NOT NULL;
-- inserting data
-- trip
insert into trip(trip_name, country, trip_date, max_no_places)
values ('Wycieczka do Paryza', 'Francja', to_date('2023-09-12', 'YYYY-MM-DD'), 3);
insert into trip(trip_name, country, trip_date, max_no_places)
values ('Piekny Krakow', 'Polska', to_date('2025-05-03','YYYY-MM-DD'), 2);
insert into trip(trip_name, country, trip_date, max_no_places)
values ('Znow do Francji', 'Francja', to_date('2025-05-01','YYYY-MM-DD'), 2);
insert into trip(trip_name, country, trip_date, max_no_places)
values ('Hel', 'Polska', to_date('2025-05-01','YYYY-MM-DD'), 2);
-- person
insert into person(firstname, lastname)
values ('Jan', 'Nowak');
insert into person(firstname, lastname)
values ('Jan', 'Kowalski');
insert into person(firstname, lastname)
values ('Jan', 'Nowakowski');
insert into person(firstname, lastname)
values ('Novak', 'Nowak');
-- reservation
-- trip1
insert into reservation(trip_id, person_id, status, no_tickets)
values (1, 1, 'P',1);
2025-03-05
insert into reservation(trip_id, person_id, status, no_tickets)
values (1, 2, 'N',2);
-- trip 2
insert into reservation(trip_id, person_id, status, no_tickets)
values (2, 1, 'P',1);
insert into reservation(trip_id, person_id, status, no_tickets)
values (2, 4, 'C',4);
-- trip 3
insert into reservation(trip_id, person_id, status, no_tickets)
values (2, 4, 'P',3)
```

### Działanie transakcji

Transakcje korzystająca ze zasady ACID. Każdy wykonany operacja jest domyślnie transakcją i musi być zatwierdzony przez komendę commit.
Jeśli przy jakimś wyowłaniu wyrażenia nastąpi błąd, cała transkacja domyślnie zostanie cofnięta przez rollback, cofając wszystkie zmiany od początku transkacji. W TSQL transakcje są jawnie deklarowane za pomocą BEGIN TRANSACTION, a w przypadku błędu należy wykonać rollback w bloku try catch. W MS SQL Server również transakcje nie są automatyczne i wymagają jawnego rozpoczęcia.

## zad 1

## zad 2 Funkcje

- **f_trip_participants**

  ```sql
  create or replace type trip_participant as OBJECT
  ( trip_name varchar(100),
  firstname varchar(50),
  lastname varchar(50),
  trip_id int ,
  person_id int
  );

    create or replace type trip_participant_table is table of trip_participant;
    create or replace function f_trip_participants(trip_id int)
    return trip_participant_table
    as
    result trip_participant_table;
    begin

        if not exists (SELECT 1 FROM TRIP t WHERE t.TRIP_ID=f_trip_participants.trip_id)then
            raise_application_error(-20001, 'invalid trip id');
        end if;

        select trip_participant(res.trip_name,res.firstname, res.lastname, res.trip_id, res.person_id)
                bulk collect
        into result
        from vw_reservation res
        where res.trip_id = f_trip_participants.trip_id;
        if result.COUNT =0 then
            raise_application_error(-20001, 'No participants found for this trip');
        end if;
        return result;

    end;
  ```

- **f_person_reservations**

  ```sql
  create or replace type person_reservation as OBJECT
  (
  status char(1),
  firstname varchar(50),
  lastname varchar(50),
  person_id int,
  reservation_id int,
  trip_id int
  );

  create or replace type person_reservation_table is table of person_reservation;
  create or replace function f_person_reservations(person_id int)
  return person_reservation_table
  as
  result person_reservation_table;
  begin

  if not exists (SELECT 1 FROM PERSON t WHERE t.PERSON_ID=f_person_reservations.person_id)then
      raise_application_error(-20001, 'invalid trip id');
  end if;
  select person_reservation(res.status,,res.firstname, res.lastname, res.person_id,res.reservation_id,res.trip_id)
          bulk collect
  into result
  from vw_reservation res
  where res.person_id = f_person_reservations.person_id;

  if result.COUNT =0 then
      raise_application_error(-20001, 'No reservations found for this person');
  end if;

  return result;

  end;
  ```

- **f_available_trips_to**

  ```sql
  create or replace type available_trips_to as OBJECT
      (
      trip_name varchar(100),
      trip_date date,
      trip_id int
      );
      create or replace type available_trips_to_table is table of available_trips_to;
      create or replace function f_available_trips_to(country varchar(50), date_from date, date_to date)
      return available_trips_to_table
      as
      result available_trips_to_table;
      begin

          select distinct available_trips_to(t.TRIP_NAME,t.TRIP_DATE, t.TRIP_ID)
                  bulk collect
          into result
          from TRIP t
          where t.COUNTRY = f_available_trips_to.country and t.TRIP_DATE>=f_available_trips_to.date_from and  t.TRIP_DATE<=f_available_trips_to.date_to;

          if result.COUNT =0 then
              raise_application_error(-20001, 'No available found for this country in this period');
          end if;

          return result;

      end;
  ```
