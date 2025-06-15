using System;
using Microsoft.EntityFrameworkCore;
// if (File.Exists("MyProductDatabase"))
// {
//     File.Delete("MyProductDatabase");
//     Console.WriteLine("Stara baza danych usunięta.");
// }
// Console.WriteLine("Podaj nazwę produktu: ");
// String? prodName = Console.ReadLine();
// ProdContext productContext = new ProdContext();
// productContext.Database.EnsureCreated();
// Product product = new Product { ProductName = "Flamaster" };
// productContext.Products.Add(product);
// Product product1 = new Product { ProductName = "Flamaster" };
// productContext.Products.Add(product1);
// Product product2 = new Product { ProductName = prodName };
// productContext.Products.Add(product2);
// productContext.SaveChanges();

// var query = from prod in productContext.Products
//             select prod.ProductName;
// foreach (var pName in query)
// {
//     Console.WriteLine(pName);
// }
// // Usuń stary plik bazy danych jeśli istnieje 
// if (File.Exists("MyProductDatabase"))
// {
//     File.Delete("MyProductDatabase");
//     Console.WriteLine("Stara baza danych usunięta.");
// }

// a)
// ProdContext context = new ProdContext();
// //Tworzenie supplliera
// Supplier supplier = new Supplier { CompanyName = "Okta", Street="Krola Augusta",City="Krakow" };
// //Przypisanie produktu do dostawcy
// context.Suppliers.Add(supplier);
// //Wyszukiwanie produktu
// var query2 = from prod in context.Products
//             where prod.ProductName == "kredki"
//              select prod;
// foreach (Product product in query2)
// {
//     Console.WriteLine(product.ProductName);
//     product.Supplier = supplier;
// }
// context.SaveChanges();

// b)
// ProdContext context = new ProdContext();

// //Tworzenie kilka produktów
// Product p1 = new Product { ProductName  = "Pilka", UnitsInStock =10 };
// Product p2 = new Product { ProductName  = "Deska", UnitsInStock =2 };
// Product p3 = new Product { ProductName  = "Kubek", UnitsInStock =4 };

// // Dodanie produktów do tabeli Products
// context.Products.Add(p1);
// context.Products.Add(p2);
// context.Products.Add(p3);
// context.SaveChanges();

// // Wyszukanie dostawcy
// var supplier = context.Suppliers
//     .Where(s => s.CompanyName == "Okta")
//     .FirstOrDefault();
// if (supplier == null)
//     return;
// if (supplier.Products == null)
//     supplier.Products = new List<Product>();

// // Dodanie produktów do dostawcy
// supplier.Products.Add(p1);
// supplier.Products.Add(p2);
// supplier.Products.Add(p3);

// context.SaveChanges();

// // d)
// if (File.Exists("MyProductDatabase"))
// {
//     File.Delete("MyProductDatabase");
//     Console.WriteLine("Stara baza danych usunięta.");
// }

// ProdContext context = new ProdContext();
// context.Database.EnsureCreated();

// // Tworzenie kilku produktów
// Product p1 = new Product { ProductName = "Wiosla", UnitsInStock = 8 };
// Product p2 = new Product { ProductName = "Szklanka", UnitsInStock = 21 };
// Product p3 = new Product { ProductName = "Karton", UnitsInStock = 23 };
// Product p4 = new Product { ProductName = "Zeszyt", UnitsInStock = 12 };

// // Dodanie produktów do tabeli Products
// context.Products.AddRange(p1, p2, p3, p4);
// context.SaveChanges();

// // Tworzenie kilku faktur
// Invoice i1 = new Invoice { InvoiceNumber = 342, Quantity = 3 };
// Invoice i2 = new Invoice { InvoiceNumber = 654, Quantity = 5 };
// Invoice i3 = new Invoice { InvoiceNumber = 111, Quantity = 6 };

// i1.Products = new List<Product>();
// i2.Products = new List<Product>();
// i3.Products = new List<Product>();

// p1.Invoices = new List<Invoice>();
// p2.Invoices = new List<Invoice>();
// p3.Invoices = new List<Invoice>();
// p4.Invoices = new List<Invoice>();

// // Dodanie faktur do tabeli Invoices
// context.Invoices.AddRange(i1, i2, i3);
// context.SaveChanges();

// // Sprzedaż produktów - przypisanie ich do faktur
// // Faktura 1 
// i1.Products.Add(p1); 
// i1.Products.Add(p2);
// p1.Invoices.Add(i1);
// p2.Invoices.Add(i1);

// // Faktura 2 
// i2.Products.Add(p3); 
// p3.Invoices.Add(i2);

// // Faktura 3 
// i3.Products.Add(p3); 
// i3.Products.Add(p4);
// p3.Invoices.Add(i3);
// p4.Invoices.Add(i3);

// // Zapisanie relacji
// context.SaveChanges();

// // Wyświetlenie produktów na fakturach
// Console.WriteLine("\nZawartość faktur:");

// var invoices = context.Invoices
//     .Include(i => i.Products)
//     .ToList();

// foreach (var invoice in invoices)
// {
//     Console.WriteLine($"Faktura nr {invoice.InvoiceNumber} (ID: {invoice.InvoiceID}):");
//     if (invoice.Products != null)
//     {
//         foreach (var product in invoice.Products)
//         {
//             Console.WriteLine($" - {product.ProductName} (na stanie: {product.UnitsInStock})");
//         }
//     }
//     Console.WriteLine();
// }

// // Wyświetlenie faktur dla produktów
// Console.WriteLine("\nFaktury dla poszczególnych produktów:");

// var products = context.Products
//     .Include(p => p.Invoices)
//     .ToList();

// foreach (var product in products)
// {
//     Console.WriteLine($"Produkt: {product.ProductName}");
//     if (product.Invoices != null && product.Invoices.Any())
//     {
//         Console.WriteLine("Sprzedany na fakturach:");
//         foreach (var inv in product.Invoices)
//         {
//             Console.WriteLine($" - Faktura nr {inv.InvoiceNumber}");
//         }
//     }
//     else
//     {
//         Console.WriteLine("Nie został jeszcze sprzedany.");
//     }
//     Console.WriteLine();
// }

// context.SaveChanges();

// // Usuń starą bazę danych jeśli istnieje
// if (File.Exists("MyProductDatabase"))
// {
//     File.Delete("MyProductDatabase");
//     Console.WriteLine("Stara baza danych usunięta.");
// }

// // Inicjalizacja
// ProdContext context = new ProdContext();
// context.Database.EnsureCreated();
// Console.WriteLine("Utworzono bazę danych z hierarchią dziedziczenia.");

// // Tworzenie dostawcy
// Supplier supplier = new Supplier
// {
//     CompanyName = "Biuromat",
//     Street = "Długa 15",
//     City = "Warszawa",
//     ZipCode = "01-234",
//     BankAccountNumber = "PL12345678901234567890123456"
// };
// Supplier supplier2 = new Supplier
// {
//     CompanyName = "WilkoPol",
//     Street = "Polna 15",
//     City = "Koszalin",
//     ZipCode = "23-41",
//     BankAccountNumber = "PL2134343434113"
// };
// context.Suppliers.Add(supplier);
// context.Suppliers.Add(supplier2);

// // Tworzenie klienta
// Customer customer = new Customer
// {
//     CompanyName = "AGH",
//     Street = "Al. Mickiewicza 30",
//     City = "Kraków",
//     ZipCode = "30-059",
//     Discount = 10
// };
// Customer customer2 = new Customer
// {
//     CompanyName = "Deloitte",
//     Street = "Al. Jana Pawła II 22",
//     City = "Kraków",
//     ZipCode = "32-259",
//     Discount = 12
// };
// context.Customers.Add(customer);
// context.Customers.Add(customer2);
// context.SaveChanges();

// // Wyświetlenie wszystkich firm
// Console.WriteLine("\nWszystkie firmy:");
// var companies = context.Companies.ToList();
// foreach (var company in companies)
// {
//     Console.WriteLine($"ID: {company.CompanyID}, Nazwa: {company.CompanyName}, Typ: {company.CompanyType}, Miasto: {company.City}");
// }


if (File.Exists("MyProductDatabase"))
{
    File.Delete("MyProductDatabase");
    Console.WriteLine("Stara baza danych usunięta.");
}

ProdContext context = new ProdContext();
context.Database.EnsureCreated();

// Tworzenie dostawców
Supplier supplier1 = new Supplier
{
    CompanyName = "Artykuły Biurowe XYZ",
    Street = "Przemysłowa 10",
    City = "Kraków",
    ZipCode = "30-001",
    BankAccountNumber = "PL61109010140000071219812874"
};

Supplier supplier2 = new Supplier
{
    CompanyName = "HurtPol",
    Street = "Składowa 5",
    City = "Warszawa",
    ZipCode = "00-950",
    BankAccountNumber = "PL27114020040000300201355387"
};

// Tworzenie klientów
Customer customer1 = new Customer
{
    CompanyName = "Uniwersytet AGH",
    Street = "Al. Mickiewicza 30",
    City = "Kraków",
    ZipCode = "30-059",
    Discount = 15
};

Customer customer2 = new Customer
{
    CompanyName = "TechStart SA",
    Street = "Nowa 7",
    City = "Gdańsk",
    ZipCode = "80-864",
    Discount = 8
};

// Dodanie do bazy danych
context.Suppliers.Add(supplier1);
context.Suppliers.Add(supplier2);
context.Customers.Add(customer1);
context.Customers.Add(customer2);
context.SaveChanges();

// i. Pobieranie firm z bazy danych
Console.WriteLine("\n=== Wszyscy dostawcy ===");
var suppliers = context.Suppliers.ToList();
foreach (var s in suppliers)
{
    Console.WriteLine($"ID: {s.CompanyID}, Nazwa: {s.CompanyName}, Miasto: {s.City}, Nr konta: {s.BankAccountNumber}");
}

Console.WriteLine("\n=== Wszyscy klienci ===");
var customers = context.Customers.ToList();
foreach (var c in customers)
{
    Console.WriteLine($"ID: {c.CompanyID}, Nazwa: {c.CompanyName}, Miasto: {c.City}, Rabat: {c.Discount}%");
}

Console.WriteLine("\n=== Wszystkie firmy ===");
var companies = context.Companies.ToList();
foreach (var company in companies)
{
    Console.WriteLine($"ID: {company.CompanyID}, Nazwa: {company.CompanyName}, Typ: {company.CompanyType}, Miasto: {company.City}");
}
