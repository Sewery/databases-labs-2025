create or replace function f_get_available_places(trip_id in TRIP.TRIP_ID%type)
    return number
as
    no_available_places number;
begin
    select MAX_NO_PLACES - (select COALESCE(sum(NO_TICKETS), 0)
                            from RESERVATION R
                            where R.TRIP_ID = trip_id and R.STATUS<>'C')
    into no_available_places
    from TRIP T
    where T.TRIP_ID = trip_id;

    return no_available_places;
end;
