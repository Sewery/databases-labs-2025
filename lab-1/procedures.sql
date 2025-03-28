create or replace procedure p_check_trip_exists(trip_id in TRIP.TRIP_ID%type)
    as
        tmp char(1);
    begin
        select 1 into tmp from TRIP T where T.TRIP_ID=trip_id;
    exception
        when NO_DATA_FOUND then
            raise_application_error(-20001, 'reservation not found !!!');
    end;

create or replace procedure p_check_reservation_exists(res_id in RESERVATION.RESERVATION_ID%type)
    as
        tmp char(1);
    begin
        select 1 into tmp from RESERVATION R where R.RESERVATION_ID=res_id;
    exception
        when NO_DATA_FOUND then
            raise_application_error(-20001, 'reservation not found !!!');
    end;

create or replace procedure p_modify_reservation(res_id in RESERVATION.RESERVATION_ID%type, no_tickets number)
    as
        trip_id TRIP.TRIP_ID%type;
        available_places number;
        current_no_tickets number;
        res_status varchar2(10);
    begin
        p_check_reservation_exists(res_id);

        select NO_AVAILABLE_PLACES into available_places from VW_TRIP where VW_TRIP.TRIP_ID=trip_id;
        select R.TRIP_ID, R.NO_TICKETS, R.STATUS into trip_id, current_no_tickets, res_status
        from RESERVATION R
        where R.RESERVATION_ID = res_id;

        if (available_places-(no_tickets-current_no_tickets))<0 then
            raise_application_error(-20001, 'not enough free places');
        end if;
        if (res_status<>'N') then
            raise_application_error(-20001, 'wrong application status');
        end if;

        update RESERVATION R
            set NO_TICKETS=no_tickets
        where R.RESERVATION_ID=res_id;

        insert into LOG(reservation_id, log_date, status, no_tickets) values(res_id, CURRENT_DATE, res_status, no_tickets);
        commit;
    end;

create or replace procedure p_modify_max_no_places(trip_id in TRIP.TRIP_ID%type, max_no_places number)
    as
        booked_places number;
    begin
        p_check_trip_exists(trip_id);

        select coalesce(sum(NO_TICKETS), 0) into booked_places from RESERVATION R where R.TRIP_ID=trip_id;

        if booked_places>max_no_places then
            raise_application_error(-20001, 'max_no_places lower than no of booked places');
        end if;

        update TRIP T
            set T.MAX_NO_PLACES=max_no_places
        where T.TRIP_ID=trip_id;
        commit;
    end;
