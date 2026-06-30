using Microsoft.Extensions.Logging;
using TechAssessment.Application.Common.Interfaces;
using TechAssessment.Domain.Events;

namespace TechAssessment.Application.SponsorshipRequests.Events;

public class SponsorShipFinanceApprovalEventHandler : INotificationHandler<SponsorShipApprovedEvent>
{
    private readonly ILogger _logger;
    private readonly IUser _user;
    public SponsorShipFinanceApprovalEventHandler(ILogger<SponsorShipApprovedEvent> logger, IUser user)
    {
        _logger = logger;
        _user = user;
    }

    public Task HandleAsync(SponsorShipApprovedEvent notification, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"Handling {notification}");


        _logger.LogInformation("TechAssessment Request: Finance Approved Service is handled : {@Id}",
            _user.Id);

        return Task.CompletedTask;
    }
}
