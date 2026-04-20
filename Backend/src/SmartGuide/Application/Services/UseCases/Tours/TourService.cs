using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Tour;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Tour;
using Domain.Entities.Tours;
using Domain.Entities.Tours.Enums;
using Domain.Interfaces;
using System.Text.Json;

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
                    .ToList(),

                Stops = tour.TourStops.Select(s => new CreateTourStopDto
                {
                    Title = s.Title,
                    Description = s.Description,
                    OrderIndex = s.OrderIndex
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


        public async Task<CreateTourResponseDTO> CreateTourAsync(
            CreateTourRequestDTO request,
            string guideId)
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

                // ✅ Create Tour
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

                // Stops
                if (stops.Any())
                {
                    tour.TourStops = stops.Select(s => new TourStops(
                        tour.Id,
                        s.OrderIndex,
                        s.Title,
                        s.Description
                    )).ToList();
                }

                // Inclusions
                if (inclusions.Any())
                {
                    tour.TourInclusions = inclusions.Select(i => new TourInclusion
                    {
                        Id = Guid.NewGuid(),
                        TourId = tour.Id,
                        Description = i.Description,
                        Type = Enum.Parse<InclusionType>(i.Type, true)
                    }).ToList();
                }

                // AddOns
                if (addons.Any())
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

                // ✅ Upload Images
                var uploadedFiles = new List<string>();
                var folderName = $"ToursImages/{tour.Id}";

                if (request.Images.Any())
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
                        // rollback images
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

                // ✅ Save
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

        public async Task<OperationResultDto> UpdateTourAsync(
                                                            Guid id,
                                                            CreateTourRequestDTO request,
                                                            string guideId)
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
                s.Description
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

            if (request.Images != null && request.Images.Any())
            {
                var folderName = $"ToursImages/{tour.Id}";

                foreach (var img in tour.TourImages)
                {
                    try
                    {
                        await _attachmentService.Delete(img.ImageUrl, folderName);
                    }
                    catch { }
                }

                await _tourRepository.RemoveTourImagesAsync(tour);

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



                tour.TourImages = uploadedFiles.Select((file, index) => new TourImage
                {
                    Id = Guid.NewGuid(),
                    TourId = tour.Id,
                    ImageUrl = file,
                    IsPrimary = index == 0,
                    OrderIndex = index + 1
                }).ToList();
            }

            await _tourRepository.UpdateAsync(tour);

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
    }
}