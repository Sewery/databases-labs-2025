using System.Collections.ObjectModel;

public class Supplier
{
    public int SupplierID { get; set; }
    public String? CompanyName { get; set; }
    public String? Street { get; set; }
    public String? City { get; set; }

    public ICollection<Product>? Products { get; set; }
}