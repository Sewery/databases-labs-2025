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


        select R.TRIP_ID, R.NO_TICKETS, R.STATUS into trip_id, current_no_tickets, res_status
        from RESERVATION R
        where R.RESERVATION_ID = res_id;
        select NO_AVAILABLE_PLACES into available_places from VW_TRIP where VW_TRIP.TRIP_ID=trip_id;

        if (available_places-(no_tickets-current_no_tickets))<0 then
            raise_application_error(-20001, 'not enough free places');
        end if;

        update RESERVATION R
            set NO_TICKETS=no_tickets
        where R.RESERVATION_ID=res_id;

        insert into LOG(reservation_id, log_date, status, no_tickets) values(res_id, CURRENT_DATE, res_status, no_tickets);
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
    end;

-- zadanie 4
create or replace procedure p_modify_reservation_4(res_id in RESERVATION.RESERVATION_ID%type, no_tickets number)
    as
        trip_id TRIP.TRIP_ID%type;
        available_places number;
        current_no_tickets number;
        res_status varchar2(10);
    begin
        p_check_reservation_exists(res_id);

        select R.TRIP_ID, R.NO_TICKETS, R.STATUS into trip_id, current_no_tickets, res_status
        from RESERVATION R
        where R.RESERVATION_ID = res_id;
        select NO_AVAILABLE_PLACES into available_places from VW_TRIP where VW_TRIP.TRIP_ID=trip_id;

        if (available_places-(no_tickets-current_no_tickets))<0 then
            raise_application_error(-20001, 'not enough free places');
        end if;

        update RESERVATION R
            set NO_TICKETS=no_tickets
        where R.RESERVATION_ID=res_id;
    end;

-- zadanie 5
create or replace procedure p_modify_reservation_5(res_id in RESERVATION.RESERVATION_ID%type, pno_tickets number)
    as
        res_status varchar2(10);
    begin
        p_check_reservation_exists(res_id);

        select R.TRIP_ID, R.NO_TICKETS, R.STATUS into res_status
        from RESERVATION R
        where R.RESERVATION_ID = res_id;

        update RESERVATION R
            set NO_TICKETS=pno_tickets
        where R.RESERVATION_ID=res_id;
    end;

--procedure 6a

create or replace procedure p_trip_update_no_available_places is
    begin
    update trip t
    set t.no_available_places = t.max_no_places - (
        select coalesce(sum(r.no_tickets), 0)
        from reservation r
        where r.trip_id = t.trip_id AND r.status <> 'C'
    );
    end;
/
create procedure p_modify_max_no_places_6a(trip_id in TRIP.TRIP_ID%type, new_max_no_places number)
    as
        cur_max_places number;
        cur_av_places number;
    begin
        p_check_trip_exists(trip_id);

        select T.max_no_places, NO_AVAILABLE_PLACES into cur_max_places, cur_av_places from TRIP T where T.trip_id=p_modify_max_no_places_6a.trip_id;

        if cur_max_places-new_max_no_places>cur_av_places then
            raise_application_error(-20001, 'max_no_places dif lower than no of available places');
        end if;

        update TRIP T
            set T.max_no_places=new_max_no_places, T.NO_AVAILABLE_PLACES = cur_av_places + (new_max_no_places - cur_max_places)
        where T.trip_id=p_modify_max_no_places_6a.trip_id;
    end;
/
create or replace procedure p_modify_reservation_6a(res_id in RESERVATION.RESERVATION_ID%type, pno_tickets number)
as
    res_status varchar2(10);
    cur_no_tickets number;
    cur_trip_id TRIP.TRIP_ID%type;
begin
    p_check_reservation_exists(res_id);

    select R.TRIP_ID, R.NO_TICKETS, R.STATUS into cur_trip_id,cur_no_tickets,res_status
    from RESERVATION R
    where R.RESERVATION_ID = res_id;

    update RESERVATION R
        set NO_TICKETS=pno_tickets
    where R.RESERVATION_ID=res_id;

    update TRIP T
        set T.NO_AVAILABLE_PLACES = T.NO_AVAILABLE_PLACES - (pno_tickets - cur_no_tickets)
    where T.TRIP_ID=cur_trip_id;
end;
    /

create procedure p_modify_reservation_status_6a (
    v_reservation_id number,
    v_status char
) as
    curr_date date;
    no_tickets number := 0;
    curr_res_status char(1);
    v_trip_id      TRIP.TRIP_ID%TYPE;
begin
    curr_date := trunc(sysdate);
    p_check_reservation_exists(v_reservation_id);

    SELECT r.status, r.trip_id
      INTO curr_res_status, v_trip_id
      FROM reservation r
     WHERE r.reservation_id = v_reservation_id;

    if curr_res_status = 'C' then
        begin
            select no_tickets into no_tickets
            from vw_reservation t
            where v_reservation_id = t.reservation_id
              and t.no_tickets <= f_get_available_places(t.RESERVATION_ID);
        exception
            when no_data_found then
                raise_application_error(-20001, 'No available places for reservation');
        end;
    end if;

    update reservation
    set status = v_status
    where reservation_id = v_reservation_id;

    insert into log (reservation_id, log_date, status, no_tickets)
    values (
               v_reservation_id,
               curr_date,
               v_status,
               no_tickets
           );

    IF curr_res_status = 'C' AND v_status <> 'C' THEN
        UPDATE trip
           SET no_available_places = no_available_places - no_tickets
         WHERE trip_id = v_trip_id;
    ELSIF curr_res_status <> 'C' AND v_status = 'C' THEN
        UPDATE trip
           SET no_available_places = no_available_places + no_tickets
         WHERE trip_id = v_trip_id;
    END IF;
end;
/

--zadanie 6b