-- ZADANIE 0
-- ALTER TABLE RESERVATION
--   ADD no_tickets number default 1 check ( no_tickets>0 );
--
-- ALTER TABLE LOG
--   ADD no_tickets number default 1 check ( no_tickets>0 );
--
-- commit

--ZADANIE 1
create or replace view vw_reservation
as
    select R.RESERVATION_ID, COUNTRY, TRIP_DATE, TRIP_NAME, FIRSTNAME, LASTNAME, R.STATUS, R.TRIP_ID, R.PERSON_ID, R.NO_TICKETS
    from RESERVATION R
    join PERSON P on R.PERSON_ID = P.PERSON_ID
    join TRIP T on R.TRIP_ID = T.TRIP_ID;

commit;
select * from vw_reservation;

create or replace view vw_trip
as
    select TRIP_ID, COUNTRY, TRIP_DATE, TRIP_NAME, MAX_NO_PLACES,
           MAX_NO_PLACES - (select COALESCE(sum(NO_TICKETS), 0)
            from RESERVATION R where R.TRIP_ID = TRIP.TRIP_ID and R.STATUS<>'C') as NO_AVAILABLE_PLACES
    from TRIP;
commit;

select * from vw_trip;

create or replace view vw_available_trip
as
    select * from vw_trip
    where NO_AVAILABLE_PLACES>0 and TRIP_DATE>CURRENT_DATE ;
commit;

select * from vw_available_trip
