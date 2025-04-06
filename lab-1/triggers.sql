--zadanie 4
create or replace trigger tr_log_ins_upd
    after insert or update
    on RESERVATION
    for each row
        begin
            insert into LOG(reservation_id, log_date, status, no_tickets)
            values (:NEW.RESERVATION_ID, CURRENT_DATE, :NEW.STATUS, :NEW.NO_TICKETS);
        end;

create or replace trigger tr_reservation_del
    before delete
    on RESERVATION
    begin
        raise_application_error(-20001,'reservations can not be deleted');
    end;

--zadanie 5
create or replace trigger tr_reservation_ins_upd
    before insert or update
    on RESERVATION
    for each row
        begin
            if :NEW.STATUS<>'C' and :NEW.NO_TICKETS > F_GET_AVAILABLE_PLACES(:NEW.TRIP_ID) then
                RAISE_APPLICATION_ERROR(-20001, 'not enough available places');
            end if;
        end;

--zadanie 6a
create or replace trigger tr_reservation_ins_upd_6a
    before insert or update
    on RESERVATION
    for each row
    declare v_available_places number;
        begin
            select coalesce(NO_AVAILABLE_PLACES,0) into v_available_places
            from TRIP where TRIP.TRIP_ID=:NEW.TRIP_ID;
            if :NEW.STATUS<>'C' and :NEW.NO_TICKETS > v_available_places then
                RAISE_APPLICATION_ERROR(-20001, 'not enough available places');
            end if;
        end;
/
--zadanie 6b

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