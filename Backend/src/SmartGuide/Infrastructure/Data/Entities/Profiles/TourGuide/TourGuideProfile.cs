using Infrastructure.Data.Entities.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Infrastructure.Data.Entities.Profiles.TourGuide
{
    public class TourGuideProfile
    {
        public string UserId { get; set; }

        public ApplicationUser User { get; set; }

        public string? Bio { get; set; }

        public double? PricePerDay { get; set; } 
        public double Rating { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public ICollection<TourGuideCity>? Cities { get; set; }=new List<TourGuideCity>();

        public ICollection<TourGuideLanguage>? Languages { get; set; }= new List<TourGuideLanguage>();

        public ICollection<TourGuideGallery>? Gallery { get; set; } =new List<TourGuideGallery>();
    }
}
