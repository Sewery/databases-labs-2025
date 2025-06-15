using System.Collections.ObjectModel;

public class Product
{
    public Product(){   
        this.Invoices = new HashSet<Invoice>();
    }
    public int ProductID { get; set; }
    public String? ProductName { get; set; }
    public int UnitsInStock { get; set; }

    public int? SupplierID { get; set; }
    public Supplier? Supplier { get; set; }

    public virtual ICollection<Invoice>? Invoices { get; set; }
}