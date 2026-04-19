using Application.DTOs.Tour;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Tour;
using Domain.Entities.Tours;
using Domain.Entities.Tours.Enums;
using Domain.Interfaces;

namespace Application.Services.UseCases.Tours
{
    public class TourService : ITourService
    {
        private readonly ITourRepository _tourRepository;
        private readonly IImageUrlService _imageUrlService;
        private readonly IAttachmentService _attachmentService;

        public TourService(
            ITourRepository tourRepository,
            IImageUrlService imageUrlService,
            IAttachmentService attachmentService)
        {
            _tourRepository = tourRepository;
            _imageUrlService = imageUrlService;
            _attachmentService = attachmentService;
        }

        
        public async Task<List<TourListItemDto>> GetGuideToursAsync(string guideId)
        {
            var tours = await _tourRepository.GetGuideToursAsync(guideId);

            return tours.Select(t => new TourListItemDto
            {
                Id = t.Id,
                Title = t.Title,
                DurationHours = t.DurationHours,
                Price = t.Price,
                PrimaryImage = _imageUrlService.ToPublicImageUrl(
                    t.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
                    "ToursImages"
                ) ?? string.Empty
            }).ToList();
        }

        public async Task<TourListItemDto?> GetTourByIdAsync(Guid tourId)
        {
            var tour = await _tourRepository.GetByIdAsync(tourId);
            if (tour == null || !tour.IsActive)
            {
                return null;
            }

            return new TourListItemDto
            {
                Id = tour.Id,
                Title = tour.Title,
                DurationHours = tour.DurationHours,
                Price = tour.Price,
                PrimaryImage = _imageUrlService.ToPublicImageUrl(
                    tour.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
                    "ToursImages"
                ) ?? string.Empty
            };
        }

      
        public async Task<CreateTourResponseDTO> CreateTourAsync(
            CreateTourRequestDTO request,
            string guideId)
        {
            if (string.IsNullOrWhiteSpace(guideId))
            {
                return new CreateTourResponseDTO
                {
                    IsSucceded = false,
                    message = "Guide user is required"
                };
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return new CreateTourResponseDTO
                {
                    IsSucceded = false,
                    message = "Title is required"
                };
            }
            if (request.Price < 0)
            {
                return new CreateTourResponseDTO
                {
                    IsSucceded = false,
                    message = "Price cannot be negative"
                };
            }

            if (request.MaxGroupSize <= 0)
            {
                return new CreateTourResponseDTO
                {
                    IsSucceded = false,
                    message = "Max group size must be greater than zero"
                };
            }

            if (request.Images.Any(i => i.Image == null))
            {
                return new CreateTourResponseDTO
                {
                    IsSucceded = false,
                    message = "Each image item must include a file"
                };
            }

            if (request.Images.Any())
            {
                var primaryCount = request.Images.Count(i => i.IsPrimary);
                if (primaryCount > 1)
                    return new CreateTourResponseDTO
                    {
                        IsSucceded = false,
                        message = "Only one primary image is allowed"
                    };
            }

            if (request.Stops.Any())
            {
                var hasDuplicateOrder = request.Stops
                    .GroupBy(s => s.OrderIndex)
                    .Any(g => g.Count() > 1);

                if (hasDuplicateOrder)
                    return new CreateTourResponseDTO
                    {
                        IsSucceded = false,
                        message = "Duplicate order index found in stops"
                    };
            }

            if (request.Inclusions.Any(i => !Enum.TryParse<InclusionType>(i.Type, true, out _)))
            {
                return new CreateTourResponseDTO
                {
                    IsSucceded = false,
                    message = "Invalid inclusion type. Allowed values are Included or Excluded"
                };
            }

            var tour = new Tour
            {
                Id = Guid.NewGuid(),
                GuideId = guideId,
                Title = request.Title,
                Description = request.Description,
                DurationHours = request.DurationHours,
                Price = request.Price,
                MaxGroupSize = request.MaxGroupSize,
                IsActive = true
            };

            if (request.Stops.Any())
            {
                tour.TourStops = request.Stops.Select(s => new TourStops(
                    tour.Id,
                    s.OrderIndex,
                    s.Title,
                    s.Description
                )).ToList();
            }

            if (request.Images.Any())
            {
                var uploadedFileNames = new List<string>();
                var folderName = $"ToursImages/{tour.Id}";
                try
                {
                    foreach (var i in request.Images)
                    {
                        var uploadedFileName = await _attachmentService.Upload(folderName, i.Image!);
                        if (string.IsNullOrWhiteSpace(uploadedFileName))
                        {
                            throw new InvalidOperationException("Image upload failed");
                        }

                        uploadedFileNames.Add(uploadedFileName);
                    }
                }
                catch
                {
                    foreach (var fileName in uploadedFileNames)
                    {
                        await _attachmentService.Delete(fileName, folderName);
                    }

                    return new CreateTourResponseDTO
                    {
                        IsSucceded = false,
                        message = "Failed to upload one or more images"
                    };
                }

                tour.TourImages = request.Images.Select((i, index) => new TourImage
                {
                    Id = Guid.NewGuid(),
                    TourId = tour.Id,
                    ImageUrl = uploadedFileNames[index],
                    IsPrimary = i.IsPrimary,
                    OrderIndex = i.OrderIndex
                }).ToList();

                if (!tour.TourImages.Any(i => i.IsPrimary))
                {
                    tour.TourImages.First().IsPrimary = true;
                }
            }

         
            if (request.Inclusions.Any())
            {
                tour.TourInclusions = request.Inclusions.Select(i => new TourInclusion
                {
                    Id = Guid.NewGuid(),
                    TourId = tour.Id,
                    Description = i.Description,
                    Type = Enum.TryParse<InclusionType>(i.Type, true, out var inclusionType)
                        ? inclusionType
                        : InclusionType.Included
                }).ToList();
            }

           
            if (request.AddOns.Any())
            {
                tour.TourAddOns = request.AddOns.Select(a => new TourAddOn
                {
                    Id = Guid.NewGuid(),
                    TourId = tour.Id,
                    Title = a.Title,
                    Price = a.Price,
                    IsActive = true
                }).ToList();
            }

          
            await _tourRepository.AddAsync(tour);

          
            return new CreateTourResponseDTO
            {
                IsSucceded = true,
                Id = tour.Id,
                Title = tour.Title,
                Price = tour.Price
            };
        }
    }
}