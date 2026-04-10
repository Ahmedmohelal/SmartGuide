using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.AuthenticationDTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "First name is required.")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required.")] 
        public string LastName { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        public string UserName { get; set; }
        
        [Required(ErrorMessage = "Country is required.")]
        public string Country { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string Email { get; set; }

        [Display(Name = "WhatsApp Number")]
        [MaxLength(20, ErrorMessage = "WhatsApp number cannot exceed 20 characters.")]
        [RegularExpression(@"^\+?[0-9\s\-()]{10,20}$", ErrorMessage = "Invalid WhatsApp number format. Use digits, optional + prefix, spaces, hyphens, or parentheses.")]
        public string? WhatsAppNumber { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; }

        [Required]
        [Compare("Password", ErrorMessage = "Password and Confirm Password must match")]
        public string ConfirmPassword { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        public string Role { get; set; }

        [Display(Name = "Profile Image")]
        public IFormFile? ProfileImage { get; set; }

        [Display(Name = "Guide License Image")]
        public IFormFile? GuideLicenseImage { get; set; }

        [Display(Name = "National ID Image")]
        public IFormFile? NationalIdImage { get; set; }

     
    }
}
