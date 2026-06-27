# Quick Reference: Backend Implementation Checklist

## BACKEND IMPLEMENTATION ROADMAP

### STEP 1: DOMAIN LAYER (Create New Entities)

#### Files to Create:

**1. src/Domain/Enums/SponsorshipRequestStatus.cs**
```csharp
namespace TechAssessment.Domain.Enums;

public enum SponsorshipRequestStatus
{
    Draft = 0,
    PendingManagerApproval = 1,
    PendingFinanceReview = 2,
    Approved = 3,
    Rejected = 4,
    Cancelled = 5
}
```

**2. src/Domain/Enums/ApprovalAction.cs**
```csharp
namespace TechAssessment.Domain.Enums;

public enum ApprovalAction
{
    Approve = 0,
    Reject = 1
}
```

**3. src/Domain/Entities/SponsorshipRequest.cs**
```csharp
namespace TechAssessment.Domain.Entities;

public class SponsorshipRequest : BaseAuditableEntity
{
    public string RequestorId { get; set; } = null!;
    public string RequestorName { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Department { get; set; } = null!;
    public int SponsorshipTypeId { get; set; }
    public string EventName { get; set; } = null!;
    public DateTime EventDate { get; set; }
    public decimal RequestedAmount { get; set; }
    public string Purpose { get; set; } = null!;
    public string? BusinessBenefit { get; set; }
    public string? SupportingDocumentUrl { get; set; }
    public SponsorshipRequestStatus Status { get; set; }
    public string? ManagerApprovalRemarks { get; set; }
    public string? FinanceApprovalRemarks { get; set; }
    public string? CancelledReason { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation properties
    public ICollection<SponsorshipRequestApproval> Approvals { get; set; } = [];
}
```

**4. src/Domain/Entities/SponsorshipRequestApproval.cs**
```csharp
namespace TechAssessment.Domain.Entities;

public class SponsorshipRequestApproval : BaseEntity
{
    public int SponsorshipRequestId { get; set; }
    public string ApproverId { get; set; } = null!;
    public string ApproverRole { get; set; } = null!;
    public ApprovalAction Action { get; set; }
    public string Comments { get; set; } = null!;
    public DateTime ApprovedAt { get; set; }

    // Navigation properties
    public SponsorshipRequest Request { get; set; } = null!;
}
```

**5. src/Domain/Entities/SponsorshipType.cs**
```csharp
namespace TechAssessment.Domain.Entities;

public class SponsorshipType : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; }
}
```

### STEP 2: APPLICATION LAYER (Commands & Queries)

#### Files to Create:

**Directory Structure**:
```
src/Application/SponsorshipRequests/
├── Commands/
│   ├── CreateSponsorshipRequest/
│   ├── SubmitSponsorshipRequest/
│   ├── ApproveRequest/
│   ├── RejectRequest/
│   ├── CancelRequest/
│   └── UpdateSponsorshipRequest/
├── Queries/
│   ├── GetMyRequests/
│   ├── GetPendingApprovals/
│   ├── GetRequestDetail/
│   ├── GetAllRequests/
│   └── GetSponsorshipTypes/
```

**6. CreateSponsorshipRequest Command**

`src/Application/SponsorshipRequests/Commands/CreateSponsorshipRequest/CreateSponsorshipRequestCommand.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.CreateSponsorshipRequest;

public record CreateSponsorshipRequestCommand : IRequest<int>
{
    public required string Title { get; init; }
    public required string Department { get; init; }
    public required int SponsorshipTypeId { get; init; }
    public required string EventName { get; init; }
    public required DateTime EventDate { get; init; }
    public required decimal RequestedAmount { get; init; }
    public required string Purpose { get; init; }
    public string? BusinessBenefit { get; init; }
    public string? SupportingDocumentUrl { get; init; }
}
```

`src/Application/SponsorshipRequests/Commands/CreateSponsorshipRequest/CreateSponsorshipRequestCommandValidator.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.CreateSponsorshipRequest;

public class CreateSponsorshipRequestCommandValidator : AbstractValidator<CreateSponsorshipRequestCommand>
{
    public CreateSponsorshipRequestCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(255).WithMessage("Title must not exceed 255 characters.");

        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required.");

        RuleFor(x => x.SponsorshipTypeId)
            .GreaterThan(0).WithMessage("Valid sponsorship type is required.");

        RuleFor(x => x.EventName)
            .NotEmpty().WithMessage("Event name is required.");

        RuleFor(x => x.EventDate)
            .GreaterThan(DateTime.Now).WithMessage("Event date must be in the future.");

        RuleFor(x => x.RequestedAmount)
            .GreaterThan(0).WithMessage("Requested amount must be greater than 0.");

        RuleFor(x => x.Purpose)
            .NotEmpty().WithMessage("Purpose is required.")
            .MinimumLength(10).WithMessage("Purpose must be at least 10 characters.");
    }
}
```

`src/Application/SponsorshipRequests/Commands/CreateSponsorshipRequest/CreateSponsorshipRequestCommandHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.CreateSponsorshipRequest;

public class CreateSponsorshipRequestCommandHandler : IRequestHandler<CreateSponsorshipRequestCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public CreateSponsorshipRequestCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<int> Handle(CreateSponsorshipRequestCommand request, CancellationToken cancellationToken)
    {
        var userId = _user.Id;
        var userName = _user.Name ?? "Unknown";

        var entity = new SponsorshipRequest
        {
            RequestorId = userId,
            RequestorName = userName,
            Title = request.Title,
            Department = request.Department,
            SponsorshipTypeId = request.SponsorshipTypeId,
            EventName = request.EventName,
            EventDate = request.EventDate,
            RequestedAmount = request.RequestedAmount,
            Purpose = request.Purpose,
            BusinessBenefit = request.BusinessBenefit,
            SupportingDocumentUrl = request.SupportingDocumentUrl,
            Status = SponsorshipRequestStatus.Draft
        };

        _context.SponsorshipRequests.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
```

**7. SubmitSponsorshipRequest Command**

`src/Application/SponsorshipRequests/Commands/SubmitSponsorshipRequest/SubmitSponsorshipRequestCommand.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.SubmitSponsorshipRequest;

public record SubmitSponsorshipRequestCommand(int Id) : IRequest;
```

`src/Application/SponsorshipRequests/Commands/SubmitSponsorshipRequest/SubmitSponsorshipRequestCommandValidator.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.SubmitSponsorshipRequest;

public class SubmitSponsorshipRequestCommandValidator : AbstractValidator<SubmitSponsorshipRequestCommand>
{
    public SubmitSponsorshipRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Valid request ID is required.");
    }
}
```

`src/Application/SponsorshipRequests/Commands/SubmitSponsorshipRequest/SubmitSponsorshipRequestCommandHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.SubmitSponsorshipRequest;

public class SubmitSponsorshipRequestCommandHandler : IRequestHandler<SubmitSponsorshipRequestCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public SubmitSponsorshipRequestCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(SubmitSponsorshipRequestCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SponsorshipRequests
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (entity.Status != SponsorshipRequestStatus.Draft)
        {
            throw new InvalidOperationException("Only draft requests can be submitted.");
        }

        if (entity.RequestorId != _user.Id)
        {
            throw new ForbiddenAccessException();
        }

        entity.Status = SponsorshipRequestStatus.PendingManagerApproval;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
```

**8. ApproveRequest Command**

`src/Application/SponsorshipRequests/Commands/ApproveRequest/ApproveRequestCommand.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.ApproveRequest;

public record ApproveRequestCommand(int Id, string Remarks, string ApproverRole) : IRequest;
```

`src/Application/SponsorshipRequests/Commands/ApproveRequest/ApproveRequestCommandValidator.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.ApproveRequest;

public class ApproveRequestCommandValidator : AbstractValidator<ApproveRequestCommand>
{
    public ApproveRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Valid request ID is required.");

        RuleFor(x => x.Remarks)
            .NotEmpty().WithMessage("Approval remarks are required.");

        RuleFor(x => x.ApproverRole)
            .NotEmpty().WithMessage("Approver role is required.");
    }
}
```

`src/Application/SponsorshipRequests/Commands/ApproveRequest/ApproveRequestCommandHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.ApproveRequest;

public class ApproveRequestCommandHandler : IRequestHandler<ApproveRequestCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public ApproveRequestCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(ApproveRequestCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SponsorshipRequests
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        // Validate current status based on approver role
        if (request.ApproverRole == "Manager" && entity.Status != SponsorshipRequestStatus.PendingManagerApproval)
        {
            throw new InvalidOperationException("Request is not pending manager approval.");
        }

        if (request.ApproverRole == "FinanceAdmin" && entity.Status != SponsorshipRequestStatus.PendingFinanceReview)
        {
            throw new InvalidOperationException("Request is not pending finance review.");
        }

        // Update status based on approver role
        if (request.ApproverRole == "Manager")
        {
            entity.Status = SponsorshipRequestStatus.PendingFinanceReview;
            entity.ManagerApprovalRemarks = request.Remarks;
        }
        else if (request.ApproverRole == "FinanceAdmin")
        {
            entity.Status = SponsorshipRequestStatus.Approved;
            entity.FinanceApprovalRemarks = request.Remarks;
        }

        // Record approval history
        var approval = new SponsorshipRequestApproval
        {
            SponsorshipRequestId = entity.Id,
            ApproverId = _user.Id ?? throw new InvalidOperationException("User ID not found."),
            ApproverRole = request.ApproverRole,
            Action = ApprovalAction.Approve,
            Comments = request.Remarks,
            ApprovedAt = DateTime.UtcNow
        };

        _context.SponsorshipRequestApprovals.Add(approval);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
```

**9. RejectRequest Command**

`src/Application/SponsorshipRequests/Commands/RejectRequest/RejectRequestCommand.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.RejectRequest;

public record RejectRequestCommand(int Id, string Remarks, string ApproverRole) : IRequest;
```

`src/Application/SponsorshipRequests/Commands/RejectRequest/RejectRequestCommandValidator.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.RejectRequest;

public class RejectRequestCommandValidator : AbstractValidator<RejectRequestCommand>
{
    public RejectRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Valid request ID is required.");

        RuleFor(x => x.Remarks)
            .NotEmpty().WithMessage("Rejection remarks are required.");
    }
}
```

`src/Application/SponsorshipRequests/Commands/RejectRequest/RejectRequestCommandHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.RejectRequest;

public class RejectRequestCommandHandler : IRequestHandler<RejectRequestCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public RejectRequestCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(RejectRequestCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SponsorshipRequests
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (entity.Status == SponsorshipRequestStatus.Approved || entity.Status == SponsorshipRequestStatus.Rejected)
        {
            throw new InvalidOperationException("Cannot reject a request that has already been approved or rejected.");
        }

        entity.Status = SponsorshipRequestStatus.Rejected;

        if (request.ApproverRole == "Manager")
        {
            entity.ManagerApprovalRemarks = request.Remarks;
        }
        else if (request.ApproverRole == "FinanceAdmin")
        {
            entity.FinanceApprovalRemarks = request.Remarks;
        }

        var approval = new SponsorshipRequestApproval
        {
            SponsorshipRequestId = entity.Id,
            ApproverId = _user.Id ?? throw new InvalidOperationException("User ID not found."),
            ApproverRole = request.ApproverRole,
            Action = ApprovalAction.Reject,
            Comments = request.Remarks,
            ApprovedAt = DateTime.UtcNow
        };

        _context.SponsorshipRequestApprovals.Add(approval);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
```

**10. CancelRequest Command**

`src/Application/SponsorshipRequests/Commands/CancelRequest/CancelRequestCommand.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.CancelRequest;

public record CancelRequestCommand(int Id, string Reason) : IRequest;
```

`src/Application/SponsorshipRequests/Commands/CancelRequest/CancelRequestCommandValidator.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.CancelRequest;

public class CancelRequestCommandValidator : AbstractValidator<CancelRequestCommand>
{
    public CancelRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Valid request ID is required.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required.");
    }
}
```

`src/Application/SponsorshipRequests/Commands/CancelRequest/CancelRequestCommandHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Commands.CancelRequest;

public class CancelRequestCommandHandler : IRequestHandler<CancelRequestCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public CancelRequestCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(CancelRequestCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SponsorshipRequests
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (entity.RequestorId != _user.Id)
        {
            throw new ForbiddenAccessException();
        }

        if (entity.Status == SponsorshipRequestStatus.Approved || entity.Status == SponsorshipRequestStatus.Rejected)
        {
            throw new InvalidOperationException("Cannot cancel a request that has been approved or rejected.");
        }

        entity.Status = SponsorshipRequestStatus.Cancelled;
        entity.CancelledReason = request.Reason;
        entity.CancelledAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
```

---

## CONTINUED IN NEXT FILE: Queries, Infrastructure, Endpoints, and Frontend Implementation

