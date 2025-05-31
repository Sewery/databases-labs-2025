using System.Collections.ObjectModel;

public class Customer : Company
{
    public int? Discount { get; set; }

    public Customer()
    {
        CompanyType = "Customer";
    }
}