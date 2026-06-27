using System;
using System.Collections.Generic;
using System.Text;

namespace TechAssessment.Application.SponsorshipRequests.Commands.SubmitSponsorshipRequest;

public record SubmitSponsorshipRequestCommand(int Id) : IRequest;
