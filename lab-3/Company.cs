using System.Collections.ObjectModel;

public abstract class Company
{
    public int CompanyID { get; set; }
    public string? CompanyName { get; set; }
    public string? Street { get; set; }    
    public string? City { get; set; }
    public string? ZipCode { get; set; } 

    // Pole do identyfikacji typu
    public string CompanyType { get; set; }   
}