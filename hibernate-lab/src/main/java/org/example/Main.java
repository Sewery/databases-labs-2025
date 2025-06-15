package org.example;

import org.example.model.*;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;

import java.util.List;

public class Main {
    private static SessionFactory sessionFactory = null;

    public static void main(String[] args) {
         sessionFactory = getSessionFactory();
         Session session = sessionFactory.openSession();

        Transaction tx = session.beginTransaction();

        Supplier supplier1 = new Supplier("ACC123", "Tech Supplies", "First St", "CityA", "12345");
        Supplier supplier2 = new Supplier("ACC124", "Build Co", "Second St", "CityB", "23456");

        Customer customer1 = new Customer(10.5, "Happy Buyer", "Third St", "CityC", "34567");
        Customer customer2 = new Customer(7.0, "Budget Buyer", "Fourth St", "CityD", "45678");

        session.persist(supplier1);
        session.persist(supplier2);
        session.persist(customer1);
        session.persist(customer2);

        tx.commit();

        List<Company> companies = session.createQuery("from Company", Company.class).list();

        System.out.println("\n=== Wczytane firmy z bazy ===");
        companies.forEach(company -> {
            System.out.println(company.getClass().getSimpleName() + ": " + company);
        });

        session.close();

    }

    private static SessionFactory getSessionFactory() {
        if (sessionFactory == null) {
            Configuration configuration = new Configuration();
            sessionFactory = configuration.configure().buildSessionFactory();
        }
        return sessionFactory;
    }
}


