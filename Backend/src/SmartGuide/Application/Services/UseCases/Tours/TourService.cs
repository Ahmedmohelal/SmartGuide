using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Tour;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.PictureMaker;
using Application.Services.Interfaces.Tour;
using Domain.Entities.Tours;
using Domain.Entities.Tours.Enums;
using Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;

namespace Application.Services.UseCases.Tours
{
    public class TourService : ITourService
    {
        private readonly ITourRepository _tourRepository;
        private readonly IImageUrlService _imageUrlService;
        private readonly IAttachmentService _attachmentService;

        private readonly IUserService _userService;

        public TourService(ITourRepository tourRepository, IImageUrlService imageUrlService, IAttachmentService attachmentService,
            IUserService userService)
        {
            _tourRepository = tourRepository;
            _imageUrlService = imageUrlService;
            _attachmentService = attachmentService;
            _userService = userService;
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
                MaxGroupSize = t.MaxGroupSize,
                PrimaryImage = _imageUrlService.ToPublicImageUrl(
                    t.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
                    $"ToursImages/{t.Id}"
                ) ?? string.Empty
            }).ToList();
        }

        public async Task<TourDetailsDto?> GetTourByIdAsync(Guid tourId)
        {
            var tour = await _tourRepository.GetByIdAsync(tourId);

            if (tour == null || !tour.IsActive)
                return null;

            return new TourDetailsDto
            {
                Id = tour.Id,
                Title = tour.Title,
                Description = tour.Description,
                DurationHours = tour.DurationHours,
                Price = tour.Price,

                Images = tour.TourImages
                    .OrderBy(i => i.OrderIndex)
                    .Select(i => _imageUrlService.ToPublicImageUrl(
                        i.ImageUrl,
                        $"ToursImages/{tour.Id}"
                    ))
                    .ToList()!,

                Stops = tour.TourStops.Select(s => new CreateTourStopDto
                {
                    Title = s.Title,
                    Description = s.Description,
                    OrderIndex = s.OrderIndex,
                    PlaceId = s.PlaceId

                }).ToList(),

                Inclusions = tour.TourInclusions.Select(i => new CreateTourInclusionDto
                {
                    Description = i.Description,
                    Type = i.Type.ToString()
                }).ToList(),

                AddOns = tour.TourAddOns.Select(a => new CreateTourAddOnDto
                {
                    Title = a.Title,
                    Price = a.Price
                }).ToList()
            };
        }


        public async Task<CreateTourResponseDTO> CreateTourAsync(CreateTourRequestDTO request, string guideId)
        {
            try
            {
                var stops = string.IsNullOrWhiteSpace(request.StopsJson)
                    ? new List<CreateTourStopDto>()
                    : JsonSerializer.Deserialize<List<CreateTourStopDto>>(request.StopsJson);

                var inclusions = string.IsNullOrWhiteSpace(request.InclusionsJson)
                    ? new List<CreateTourInclusionDto>()
                    : JsonSerializer.Deserialize<List<CreateTourInclusionDto>>(request.InclusionsJson);

                var addons = string.IsNullOrWhiteSpace(request.AddOnsJson)
                    ? new List<CreateTourAddOnDto>()
                    : JsonSerializer.Deserialize<List<CreateTourAddOnDto>>(request.AddOnsJson);

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

                if (stops != null && stops.Any())
                {
                    tour.TourStops = stops.Select(s => new TourStops(
                        tour.Id,
                        s.OrderIndex,
                        s.Title,
                        s.Description,
                        s.PlaceId
                    )).ToList();
                }

                if (inclusions != null && inclusions.Any())
                {
                    tour.TourInclusions = inclusions.Select(i => new TourInclusion
                    {
                        Id = Guid.NewGuid(),
                        TourId = tour.Id,
                        Description = i.Description,
                        Type = Enum.Parse<InclusionType>(i.Type, true)
                    }).ToList();
                }

                if (addons != null && addons.Any())
                {
                    tour.TourAddOns = addons.Select(a => new TourAddOn
                    {
                        Id = Guid.NewGuid(),
                        TourId = tour.Id,
                        Title = a.Title,
                        Price = a.Price,
                        IsActive = true
                    }).ToList();
                }

                var uploadedFiles = new List<string>();
                var folderName = $"ToursImages/{tour.Id}";

                if (request.Images != null && request.Images.Any())
                {
                    try
                    {
                        foreach (var image in request.Images)
                        {
                            var fileName = await _attachmentService.Upload(folderName, image);

                            if (string.IsNullOrWhiteSpace(fileName))
                                throw new Exception("Upload failed");

                            uploadedFiles.Add(fileName);
                        }
                    }
                    catch
                    {
                        foreach (var file in uploadedFiles)
                        {
                            try
                            {
                                await _attachmentService.Delete(file, folderName);
                            }
                            catch { }
                        }

                        return new CreateTourResponseDTO
                        {
                            IsSucceded = false,
                            message = "Image upload failed"
                        };
                    }

                    tour.TourImages = uploadedFiles.Select((file, index) => new TourImage
                    {
                        Id = Guid.NewGuid(),
                        TourId = tour.Id,
                        ImageUrl = file,
                        IsPrimary = index == 0,
                        OrderIndex = index + 1
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
            catch (Exception ex)
            {
                return new CreateTourResponseDTO
                {
                    IsSucceded = false,
                    message = ex.Message
                };
            }
        }

        public async Task<OperationResultDto> UpdateTourAsync(Guid id, CreateTourRequestDTO request, string guideId)
        {
            var tour = await _tourRepository.GetByIdAsync(id);

            if (tour == null || !tour.IsActive)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Tour not found"
                };
            }

            if (tour.GuideId != guideId)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Unauthorized"
                };
            }


            var stops = string.IsNullOrWhiteSpace(request.StopsJson)
                ? new List<CreateTourStopDto>()
                : JsonSerializer.Deserialize<List<CreateTourStopDto>>(request.StopsJson) ?? new();

            var inclusions = string.IsNullOrWhiteSpace(request.InclusionsJson)
                ? new List<CreateTourInclusionDto>()
                : JsonSerializer.Deserialize<List<CreateTourInclusionDto>>(request.InclusionsJson) ?? new();

            var addons = string.IsNullOrWhiteSpace(request.AddOnsJson)
                ? new List<CreateTourAddOnDto>()
                : JsonSerializer.Deserialize<List<CreateTourAddOnDto>>(request.AddOnsJson) ?? new();

            tour.Title = request.Title;
            tour.Description = request.Description;
            tour.DurationHours = request.DurationHours;
            tour.Price = request.Price;
            tour.MaxGroupSize = request.MaxGroupSize;

            var stopsEntities = stops.Select(s => new TourStops(
                tour.Id,
                s.OrderIndex,
                s.Title,
                s.Description,
                s.PlaceId
            )).ToList();

            var inclusionEntities = inclusions.Select(i => new TourInclusion
            {
                Id = Guid.NewGuid(),
                TourId = tour.Id,
                Description = i.Description,
                Type = Enum.Parse<InclusionType>(i.Type, true)
            }).ToList();

            var addonEntities = addons.Select(a => new TourAddOn
            {
                Id = Guid.NewGuid(),
                TourId = tour.Id,
                Title = a.Title,
                Price = a.Price,
                IsActive = true
            }).ToList();

            await _tourRepository.ReplaceTourRelationsAsync(tour, stopsEntities, inclusionEntities, addonEntities);


            List<string>? oldImageUrlsToDelete = null;

            if (request.Images != null && request.Images.Any())
            {
                var folderName = $"ToursImages/{tour.Id}";

                oldImageUrlsToDelete = tour.TourImages.Select(i => i.ImageUrl).ToList();

                var uploadedFiles = new List<string>();
                try
                {
                    foreach (var image in request.Images)
                    {
                        var fileName = await _attachmentService.Upload(folderName, image);

                        if (string.IsNullOrWhiteSpace(fileName))
                            throw new Exception("Upload failed");

                        uploadedFiles.Add(fileName);
                    }
                }
                catch
                {
                    foreach (var file in uploadedFiles)
                    {
                        try
                        {
                            await _attachmentService.Delete(file, folderName);
                        }
                        catch { }
                    }

                    return new OperationResultDto
                    {
                        IsSuccess = false,
                        Message = "Image upload failed"
                    };
                }



                var imageEntities = uploadedFiles.Select((file, index) => new TourImage
                {
                    Id = Guid.NewGuid(),
                    TourId = tour.Id,
                    ImageUrl = file,
                    IsPrimary = index == 0,
                    OrderIndex = index + 1
                }).ToList();

                await _tourRepository.ReplaceTourImagesAsync(tour, imageEntities);
            }
            await _tourRepository.UpdateAsync(tour);

            if (oldImageUrlsToDelete != null)
            {
                var folderName = $"ToursImages/{tour.Id}";
                foreach (var url in oldImageUrlsToDelete)
                {
                    try
                    {
                        await _attachmentService.Delete(url, folderName);
                    }
                    catch { }
                }
            }



            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Tour updated successfully"
            };
        }



        public async Task<OperationResultDto> DeleteTourAsync(Guid id, string guideId)
        {
            var tour = await _tourRepository.GetByIdAsync(id);

            if (tour == null || !tour.IsActive)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Tour not found"
                };
            }

            if (tour.GuideId != guideId)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Unauthorized"
                };
            }

            await _tourRepository.DeleteAsync(id);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Tour deleted successfully"
            };
        }

        public async Task<List<TourCardDto>> GetToursByPlaceAsync(int placeId)
        {
            var tours = await _tourRepository.GetToursByPlaceAsync(placeId);

            return tours.Select(t => new TourCardDto
            {
                Id = t.Id,

                Title = t.Title,

                Price = t.Price,

                DurationHours = t.DurationHours,

                ImageUrl = _imageUrlService.ToPublicImageUrl(
                    t.TourImages
                        .OrderBy(i => i.OrderIndex)
                        .FirstOrDefault()?.ImageUrl,
                    $"ToursImages/{t.Id}"
                ) ?? string.Empty
            }).ToList();
        }

        public async Task<List<GuideToursHomeDto>> GetHomeToursAsync()
        {
            var tours = await _tourRepository.GetAllActiveToursAsync();

            var groupedTours = tours.GroupBy(t => t.GuideId);

            var result = new List<GuideToursHomeDto>();

            foreach (var group in groupedTours)
            {
                var guide = await _userService.FindByIdAsync(group.Key);

                if (guide == null)
                    continue;

                result.Add(new GuideToursHomeDto
                {
                    GuideId = guide.Id,

                    GuideName = $"{guide.FirstName} {guide.LastName}",

                    GuideImage = !string.IsNullOrWhiteSpace(guide.ProfileImage)
    ? _imageUrlService.ToPublicImageUrl(
        guide.ProfileImage,
        "Profiles"
      )
    : string.Empty,

                    Tours = group.Select(t => new TourListItemDto
                    {
                        Id = t.Id,

                        Title = t.Title,

                        DurationHours = t.DurationHours,

                        MaxGroupSize = t.MaxGroupSize,

                        Price = t.Price,

                        PrimaryImage = t.TourImages != null && t.TourImages.Any()
    ? _imageUrlService.ToPublicImageUrl(
        t.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
        $"ToursImages/{t.Id}"
      )
    : string.Empty

                    }).ToList()
                });
            }

            return result;
        }

    }
}