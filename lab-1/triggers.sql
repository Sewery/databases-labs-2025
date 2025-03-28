create or replace trigger tr_log_insert
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

create or replace trigger tr_reservation_ins_upd
    before insert or update
    on RESERVATION
    for each row
        begin
            if :NEW.STATUS<>'C' and :NEW.NO_TICKETS > F_GET_AVAILABLE_PLACES(:NEW.TRIP_ID) then
                RAISE_APPLICATION_ERROR(-20001, 'not enough available places');
            end if;
        end;

commit;