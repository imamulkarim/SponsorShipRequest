using System;
using System.Collections.Generic;
using System.Text;

namespace TechAssessment.Application.SponsorshipRequests.Commands.CancelRequest;

public record CancelRequestCommand(int Id, string Reason) : IRequest;
