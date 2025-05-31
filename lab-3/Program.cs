using System;
// Console.WriteLine("Podaj nazwę produktu: ");
// String? prodName = Console.ReadLine();
// ProdContext productContext = new ProdContext();
// Product product = new Product { ProductName = "Flamaster" };
// productContext.Products.Add(product);
// productContext.SaveChanges();

// var query = from prod in productContext.Products
//             select prod.ProductName;
// foreach (var pName in query)
// {
//     Console.WriteLine(pName);
// }
//a)
ProdContext context = new ProdContext();
Supplier supplier = new Supplier { CompanyName = "Okta", Street="Krola Augusta",City="Krakow" };
context.Suppliers.Add(supplier);
var query2 = from prod in context.Products
            where prod.ProductID == 5
             select prod;
foreach (Product product in query2)
{
    Console.WriteLine(product.ProductName);
    product.Supplier = supplier;
}
context.SaveChanges();