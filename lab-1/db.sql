create sequence S_PERSON_SEQ
/

create sequence S_TRIP_SEQ
/

create sequence S_RESERVATION_SEQ
/

create sequence S_LOG_SEQ
/

create or replace type available_trips_to as OBJECT
(
    trip_name varchar(100),
    trip_date date,
    trip_id int
)
/

create or replace type trip_participant as OBJECT
(   trip_name varchar(100),
    firstname varchar(50),
    lastname varchar(50),
    trip_id int ,
    person_id int
)
/

create or replace type person_reservation as OBJECT
(
    status char(1),
    firstname varchar(50),
    lastname varchar(50),
    person_id int,
    reservation_id int,
    trip_id int
)
/

create or replace type available_trips_to_table is table of available_trips_to
/

create or replace type person_reservation_table is table of person_reservation
/

create or replace type trip_participant_table is table of trip_participant
/

create type AVAILABLE_TRIPS_TO_TABLE as table of AVAILABLE_TRIPS_TO
/

create type TRIP_PARTICIPANT_TABLE as table of TRIP_PARTICIPANT
/

create type PERSON_RESERVATION_TABLE as table of PERSON_RESERVATION
/

create table PERSON
(
    PERSON_ID NUMBER default "BD_421766"."S_PERSON_SEQ"."NEXTVAL" not null
        constraint PK_PERSON
            primary key,
    FIRSTNAME VARCHAR2(50),
    LASTNAME  VARCHAR2(50)
)
/

create table TRIP
(
    TRIP_ID             NUMBER default "BD_421766"."S_TRIP_SEQ"."NEXTVAL" not null
        constraint PK_TRIP
            primary key,
    TRIP_NAME           VARCHAR2(100),
    COUNTRY             VARCHAR2(50),
    TRIP_DATE           DATE,
    MAX_NO_PLACES       NUMBER,
    NO_AVAILABLE_PLACES NUMBER
)
/

create table RESERVATION
(
    RESERVATION_ID NUMBER default "BD_421766"."S_RESERVATION_SEQ"."NEXTVAL" not null
        constraint PK_RESERVATION
            primary key,
    TRIP_ID        NUMBER
        constraint RESERVATION_FK2
            references TRIP,
    PERSON_ID      NUMBER
        constraint RESERVATION_FK1
            references PERSON,
    STATUS         CHAR
        constraint RESERVATION_CHK1
            check (status in ('N', 'P', 'C')),
    NO_TICKETS     NUMBER default 0                                         not null
)
/

create or replace trigger TR_RESERVATION_DEL
    before delete
    on RESERVATION
begin
        raise_application_error(-20001,'reservations can not be deleted');
    end;
/

create or replace trigger TR_RESERVATION_INS_UPD
    instead of insert or update
    on RESERVATION
    for each row
    compound trigger

    type reservation_rec is record (
                                       reservation_id reservation.reservation_id%type,
                                       trip_id reservation.trip_id%type,
                                       status reservation.status%type,
                                       no_tickets reservation.no_tickets%type
                                   );

    type reservation_tab is table of reservation_rec index by binary_integer;
    reservations reservation_tab;
    ind number := 0;

    -- before each row section
before each row is
begin
    ind := ind + 1;
    reservations(ind).reservation_id := :new.reservation_id;
    reservations(ind).trip_id := :new.trip_id;
    reservations(ind).status := :new.status;
    reservations(ind).no_tickets := :new.no_tickets;
end before each row;

    after statement is
    begin
        for i in 1..ind loop
                if reservations(i).status <> 'C' then
                    declare
                        available_places number;
                    begin
                        select f_get_available_places(reservations(i).trip_id)
                        into available_places
                        from dual;

                        if reservations(i).no_tickets > available_places then
                            raise_application_error(-20001, 'not enough available places');
                        end if;
                    end;
                end if;
            end loop;
    end after statement;
    end tr_reservation_ins_upd;
/

create or replace trigger TR_LOG_INS_UPD
    after insert or update
    on RESERVATION
    for each row
begin
            insert into LOG(reservation_id, log_date, status, no_tickets)
            values (:NEW.RESERVATION_ID, CURRENT_DATE, :NEW.STATUS, :NEW.NO_TICKETS);
        end;
/
create or replace trigger tr_insert_available_places
    after insert
    on RESERVATION
    for each row
begin
    if :NEW.STATUS<>'C' then
        UPDATE trip t
        SET t.no_available_places = t.NO_AVAILABLE_PLACES - :NEW.NO_TICKETS
        WHERE t.TRIP_ID = :NEW.TRIP_ID;
    end if;
end;
/
create or replace trigger tr_reservation_ins_upd_6
    before insert or update
    on RESERVATION
    for each row
begin
    if :NEW.STATUS<>'C' and :NEW.NO_TICKETS > (select coalesce(NO_AVAILABLE_PLACES,0) from TRIP where TRIP.TRIP_ID=:NEW.TRIP_ID) then
        RAISE_APPLICATION_ERROR(-20001, 'not enough available places');
    end if;
end;
/

create table LOG
(
    LOG_ID         NUMBER default "BD_421766"."S_LOG_SEQ"."NEXTVAL" not null
        constraint PK_LOG
            primary key,
    RESERVATION_ID NUMBER                                           not null
        constraint LOG_FK1
            references RESERVATION,
    LOG_DATE       DATE                                             not null,
    STATUS         CHAR
        constraint LOG_CHK1
            check (status in ('N', 'P', 'C')),
    NO_TICKETS     NUMBER default 0                                 not null
)
/

create or replace view VW_RESERVATION as
select R.RESERVATION_ID, COUNTRY, TRIP_DATE, TRIP_NAME, FIRSTNAME, LASTNAME, R.STATUS, R.TRIP_ID, R.PERSON_ID, R.NO_TICKETS
    from RESERVATION R
    join PERSON P on R.PERSON_ID = P.PERSON_ID
    join TRIP T on R.TRIP_ID = T.TRIP_ID
/

create or replace view VW_TRIP_6 as
select TRIP_ID, COUNTRY, TRIP_DATE, TRIP_NAME, MAX_NO_PLACES, NO_AVAILABLE_PLACES
    from TRIP
/

create or replace function f_available_trips_to(country varchar, date_from date, date_to date)
    return available_trips_to_table
as
    result available_trips_to_table;
begin

    select available_trips_to(t.TRIP_NAME,t.TRIP_DATE, t.TRIP_ID)
            bulk collect
    into result
    from TRIP t
    where (t.COUNTRY = f_available_trips_to.country and t.TRIP_DATE>=f_available_trips_to.date_from and  t.TRIP_DATE<=f_available_trips_to.date_to);

    if result.COUNT =0 then
        raise_application_error(-20001, 'No available found for this country in this period');
    end if;

    return result;
end;
/

create or replace function f_trip_participants(trip_id int)
    return trip_participant_table
as
    result       trip_participant_table;
    v_trip_count int;
begin

    SELECT COUNT(*)
    INTO v_trip_count
    FROM TRIP t
    WHERE t.TRIP_ID = f_trip_participants.trip_id;

    if v_trip_count = 0 then
        raise_application_error(-20001, 'Invalid trip ID');
    end if;
    select trip_participant(res.trip_name, res.firstname, res.lastname, res.trip_id, res.person_id) bulk collect
    into result
    from vw_reservation res
    where res.trip_id = f_trip_participants.trip_id;
    if result.COUNT = 0 then
        raise_application_error(-20001, 'No participants found for this trip');
    end if;
    return result;
end;
/

create or replace function f_person_reservations(person_id int)
    return person_reservation_table
as
    result person_reservation_table;
    person_exists int;
begin
    select case
               when exists(    select *
                               from PERSON t
                               where t.PERSON_ID=f_person_reservations.person_id) then 1
               else 0
               end
    into person_exists from dual;
    if  person_exists=0 then
        raise_application_error(-20001, 'invalid person id');
    end if;
    select person_reservation(res.status,res.firstname, res.lastname, res.person_id,res.reservation_id,res.trip_id)
            bulk collect
    into result
    from vw_reservation res
    where res.person_id = f_person_reservations.person_id;

    if result.COUNT =0 then
        raise_application_error(-20001, 'No reservations found for this person');
    end if;

    return result;
end;
/

create or replace procedure p_check_reservation_exists(res_id in RESERVATION.RESERVATION_ID%type)
    as
        tmp char(1);
    begin
        select 1 into tmp from RESERVATION R where R.RESERVATION_ID=res_id;
    exception
        when NO_DATA_FOUND then
            raise_application_error(-20001, 'reservation not found !!!');
    end;
/

create or replace procedure p_check_trip_exists(res_id in RESERVATION.RESERVATION_ID%type)
    as
        tmp char(1);
    begin
        select 1 into tmp from RESERVATION R where R.RESERVATION_ID=res_id;
    exception
        when NO_DATA_FOUND then
            raise_application_error(-20001, 'reservation not found !!!');
    end;
/

create or replace procedure p_modify_max_no_places(trip_id in TRIP.TRIP_ID%type, max_no_places number)
    as
        booked_places number;
    begin
        p_check_trip_exists(trip_id);

        select coalesce(sum(NO_TICKETS), 0) into booked_places from RESERVATION R where R.TRIP_ID=p_modify_max_no_places.trip_id;

        if booked_places>max_no_places then
            raise_application_error(-20001, 'max_no_places lower than no of booked places');
        end if;

        update TRIP T
            set T.MAX_NO_PLACES=p_modify_max_no_places.max_no_places
        where T.TRIP_ID=p_modify_max_no_places.trip_id;
    end;
/

create or replace function f_get_available_places(trip_id in TRIP.TRIP_ID%type)
    return number
as
    no_available_places number;
begin
    select MAX_NO_PLACES - (select COALESCE(sum(NO_TICKETS), 0)
                            from RESERVATION R
                            where R.TRIP_ID = f_get_available_places.trip_id and R.STATUS<>'C')
    into no_available_places
    from TRIP T
    where T.TRIP_ID = f_get_available_places.trip_id;

    return no_available_places;
end;
/

create or replace view VW_TRIP as
select TRIP_ID, COUNTRY, TRIP_DATE, TRIP_NAME, MAX_NO_PLACES, f_get_available_places(TRIP_ID) as NO_AVAILABLE_PLACES
    from TRIP
/

create or replace view VW_AVAILABLE_TRIP as
select "TRIP_ID","COUNTRY","TRIP_DATE","TRIP_NAME","MAX_NO_PLACES","NO_AVAILABLE_PLACES" from vw_trip
    where NO_AVAILABLE_PLACES>0 and TRIP_DATE>CURRENT_DATE
/

create or replace procedure p_modify_reservation(res_id in RESERVATION.RESERVATION_ID%type, no_tickets number)
as
    trip_id TRIP.TRIP_ID%type;
    available_places number;
    current_no_tickets number;
    res_status varchar2(10);
begin
    p_check_reservation_exists(res_id);

    select R.TRIP_ID, R.NO_TICKETS, R.STATUS
    into trip_id, current_no_tickets, res_status
    from RESERVATION R
    where R.RESERVATION_ID = res_id;

    available_places:=F_GET_AVAILABLE_PLACES(trip_id);

    if (available_places-(no_tickets-current_no_tickets))<0 then
        raise_application_error(-20001, 'not enough free places');
    end if;
    if (res_status<>'N') then
        raise_application_error(-20001, 'wrong application status');
    end if;

    update RESERVATION R
    set R.NO_TICKETS=p_modify_reservation.no_tickets
    where R.RESERVATION_ID=res_id;

    insert into LOG(reservation_id, log_date, status, no_tickets) values(res_id, CURRENT_DATE, res_status, no_tickets);
end;
/

create or replace function f_reservation_exist(r_id in RESERVATION.RESERVATION_ID%type)
    return boolean
as
    exist number;
begin
    select case
               when exists(select * from RESERVATION where RESERVATION_ID = r_id) then 1
               else 0
               end
    into exist from dual;
    if exist = 1 then
        return true;
    else
        return false;
    end if;
end;
/

create or replace function f_get_trip_id(reservation_id in RESERVATION.RESERVATION_ID%type)
    return number
as
    vtrip_id number;
begin
    select TRIP_ID
    into vtrip_id
    from RESERVATION R
    where R.RESERVATION_ID = f_get_trip_id.reservation_id;

    return vtrip_id;
end;
/

create or replace procedure p_modify_reservation_status (
    v_reservation_id number,
    v_status char
) as
    curr_date date;
    no_tickets number := 0;
    curr_res_status char(1);
begin
    curr_date := trunc(sysdate);
    p_check_reservation_exists(v_reservation_id);

    select r.status into curr_res_status
    from reservation r
    where r.reservation_id = v_reservation_id;

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
end;
/

create or replace procedure p_check_person_exists(per_id in PERSON.PERSON_ID%type)
as
    tmp char(1);
begin
    select 1 into tmp from PERSON P where P.PERSON_ID=per_id;
exception
    when NO_DATA_FOUND then
        raise_application_error(-20001, 'person not found !!!');
end;
/

create or replace procedure p_add_reservation(trip_id int, person_id int,
                                        no_tickets int)
as
    curr_date date;
    exist int;
    res_id int;
begin
    curr_date := trunc(sysdate);

    P_CHECK_PERSON_EXISTS(person_id);

    P_CHECK_RESERVATION_EXISTS(trip_id);

    begin
        select 1 into exist
                from VW_AVAILABLE_TRIP t
                where p_add_reservation.trip_id =t.TRIP_ID and
                t.TRIP_DATE> curr_date and
                p_add_reservation.no_tickets<= t.NO_AVAILABLE_PLACES;
    exception
            when NO_DATA_FOUND then
                    raise_application_error(-20001, 'No available places for reservation');
    end;
    insert into RESERVATION(TRIP_ID,PERSON_ID,STATUS,NO_TICKETS)
    values(
           p_add_reservation.trip_id,
           p_add_reservation.person_id,
           'N',
           p_add_reservation.no_tickets)
    returning reservation_id into res_id;
    insert into LOG(RESERVATION_ID,LOG_DATE,STATUS,NO_TICKETS)
    values(
              res_id,
              curr_date,
              'N',
              p_add_reservation.no_tickets);
end;
/

create or replace procedure p_add_reservation_4(trip_id int, person_id int,
                                   no_tickets int)
as
    exist int;
begin

    P_CHECK_PERSON_EXISTS(person_id);

    P_CHECK_RESERVATION_EXISTS(trip_id);
    begin
        select 1 into exist
        from VW_AVAILABLE_TRIP t
        where p_add_reservation_4.trip_id =t.TRIP_ID and
            t.TRIP_DATE> CURRENT_DATE and
            p_add_reservation_4.no_tickets<= t.NO_AVAILABLE_PLACES;
    exception
        when NO_DATA_FOUND then
            raise_application_error(-20001, 'No available places for reservation');
    end;
    insert into RESERVATION(TRIP_ID,PERSON_ID,STATUS,NO_TICKETS)
    values(
              p_add_reservation_4.trip_id,
              p_add_reservation_4.person_id,
              'N',
              p_add_reservation_4.no_tickets);
end;
/

create or replace procedure p_modify_reservation_status_4 (
    v_reservation_id number,
    v_status char
) as
    no_tickets number := 0;
    curr_res_status char(1);
begin
    p_check_reservation_exists(v_reservation_id);

    select r.status into curr_res_status
    from reservation r
    where r.reservation_id = v_reservation_id;

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
end;
/

create or replace procedure p_modify_reservation_4(res_id in RESERVATION.RESERVATION_ID%type, no_tickets number)
as
    trip_id TRIP.TRIP_ID%type;
    available_places number;
    current_no_tickets number;
    res_status varchar2(10);
begin
    p_check_reservation_exists(res_id);

    select R.TRIP_ID, R.NO_TICKETS, R.STATUS
    into trip_id, current_no_tickets, res_status
    from RESERVATION R
    where R.RESERVATION_ID = res_id;

    available_places:=F_GET_AVAILABLE_PLACES(trip_id);

    if (available_places-(no_tickets-current_no_tickets))<0 then
        raise_application_error(-20001, 'not enough free places');
    end if;
    if (res_status<>'N') then
        raise_application_error(-20001, 'wrong application status');
    end if;

    update RESERVATION R
    set R.NO_TICKETS=p_modify_reservation_4.no_tickets
    where R.RESERVATION_ID=res_id;

end;
/

create or replace procedure p_add_reservation_5(trip_id int, person_id int,
                                     no_tickets int)
as
    curr_date date;
begin
    curr_date := trunc(sysdate);

    P_CHECK_PERSON_EXISTS(person_id);

    P_CHECK_RESERVATION_EXISTS(trip_id);

    insert into RESERVATION(TRIP_ID,PERSON_ID,STATUS,NO_TICKETS)
    values(
              p_add_reservation_5.trip_id,
              p_add_reservation_5.person_id,
              'N',
              p_add_reservation_5.no_tickets);
end;
/

create or replace procedure p_modify_reservation_status_5 (
    p_reservation_id number,
    p_status char
) as
    curr_res_status char(1);
begin
    p_check_reservation_exists(p_reservation_id);

    select r.status
    into curr_res_status
    from reservation r
    where r.reservation_id = p_reservation_id;

    update reservation
    set status = p_status
    where reservation_id = p_reservation_id;
end;
/

create or replace procedure p_modify_reservation_5(res_id in RESERVATION.RESERVATION_ID%type, no_tickets number)
as
    res_status char(1);
begin
    p_check_reservation_exists(res_id);

    select R.STATUS
    into res_status
    from RESERVATION R
    where R.RESERVATION_ID = res_id;

    if (res_status<>'N') then
        raise_application_error(-20001, 'wrong application status');
    end if;

    update RESERVATION R
    set R.NO_TICKETS=p_modify_reservation_5.no_tickets
    where R.RESERVATION_ID=res_id;

end;
/

create or replace procedure p_trip_update_no_available_places is
begin
    update TRIP t
    set t.NO_AVAILABLE_PLACES = t.MAX_NO_PLACES - (
        select coalesce(sum(r.no_tickets), 0)
        from RESERVATION r
        where r.TRIP_ID = t.TRIP_ID AND r.STATUS <> 'C'
    );
end;
    /
create or replace procedure p_modify_max_no_places_6a(trip_id in TRIP.TRIP_ID%type, max_no_places number)
as
    cur_max_places number;
    cur_av_places number;
begin
    p_check_trip_exists(trip_id);

    select MAX_NO_PLACES, NO_AVAILABLE_PLACES into cur_max_places, cur_av_places from TRIP T where T.TRIP_ID=trip_id;

    if max_no_places-cur_max_places>cur_av_places then
        raise_application_error(-20001, 'max_no_places dif lower than no of available places');
    end if;

    update TRIP T
    set T.MAX_NO_PLACES=max_no_places, T.NO_AVAILABLE_PLACES = cur_av_places - (max_no_places - cur_max_places)
    where T.TRIP_ID=trip_id;
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
create or replace trigger tr_update_available_places
    after update
    on RESERVATION
    for each row
begin
    if :NEW.STATUS<>'C' and :OLD.STATUS='C' then
        UPDATE trip t
        SET t.no_available_places = t.NO_AVAILABLE_PLACES - :NEW.NO_TICKETS
        WHERE t.TRIP_ID = :NEW.TRIP_ID;
    end if;
    if :NEW.STATUS='C' and :OLD.STATUS<>'C' then
        UPDATE trip t
        SET t.no_available_places = t.NO_AVAILABLE_PLACES + :NEW.NO_TICKETS
        WHERE t.TRIP_ID = :NEW.TRIP_ID;
    end if;
    if :NEW.STATUS=:OLD.STATUS and :OLD.STATUS<>'C' and :NEW.NO_TICKETS<>:OLD.NO_TICKETS then
        UPDATE trip t
        SET t.no_available_places = t.NO_AVAILABLE_PLACES - (:NEW.NO_TICKETS - :OLD.NO_TICKETS)
        WHERE t.TRIP_ID = :NEW.TRIP_ID;
    end if;
end;
/