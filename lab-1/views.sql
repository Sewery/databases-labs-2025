create or replace view vw_reservation
as
    select R.RESERVATION_ID, COUNTRY, TRIP_DATE, TRIP_NAME, FIRSTNAME, LASTNAME, R.STATUS, R.TRIP_ID, R.PERSON_ID, R.NO_TICKETS
    from RESERVATION R
    join PERSON P on R.PERSON_ID = P.PERSON_ID
    join TRIP T on R.TRIP_ID = T.TRIP_ID;

create or replace view vw_trip
as
    select TRIP_ID, COUNTRY, TRIP_DATE, TRIP_NAME, MAX_NO_PLACES, f_get_available_places(TRIP_ID) as NO_AVAILABLE_PLACES
    from TRIP;

create or replace view vw_available_trip
as
    select * from vw_trip
    where NO_AVAILABLE_PLACES>0 and TRIP_DATE>CURRENT_DATE ;

--zadanie 6
create or replace view vw_trip_6
as
    select TRIP_ID, COUNTRY, TRIP_DATE, TRIP_NAME, MAX_NO_PLACES, NO_AVAILABLE_PLACES
    from TRIP;
