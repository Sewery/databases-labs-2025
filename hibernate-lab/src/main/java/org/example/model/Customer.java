package org.example.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
public class Customer extends Company{
    private double discount;

    public Customer(double discount, String companyName, String street, String city, String zipCode) {
        super(companyName, street, city, zipCode);
        this.discount = discount;
    }
    public Customer() {}

}
