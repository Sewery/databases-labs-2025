using System.Collections.ObjectModel;

public class Supplier : Company
{
    public string? BankAccountNumber { get; set; }
    
    public Supplier()
    {
        CompanyType = "Supplier";
    }
}