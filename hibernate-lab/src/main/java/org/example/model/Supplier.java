package org.example.model;

import jakarta.persistence.*;


@Entity
public class Supplier extends Company {
    private String accountNumber;

    public Supplier() {}

    public Supplier(String accountNumber, String companyName, String street, String city, String zipCode) {
        super(companyName, street, city, zipCode);
        this.accountNumber = accountNumber;
    }


}
