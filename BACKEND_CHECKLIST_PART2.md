# Quick Reference: Backend Implementation Checklist - PART 2

## STEP 2 CONTINUED: APPLICATION LAYER - QUERIES

**11. GetMyRequests Query**

`src/Application/SponsorshipRequests/Queries/GetMyRequests/GetMyRequestsQuery.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetMyRequests;

public record GetMyRequestsQuery : IRequest<MyRequestsVm>;
```

`src/Application/SponsorshipRequests/Queries/GetMyRequests/SponsorshipRequestDto.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetMyRequests;

public class SponsorshipRequestDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string SponsorshipType { get; set; } = null!;
    public string EventName { get; set; } = null!;
    public DateTime EventDate { get; set; }
    public decimal RequestedAmount { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; }
}
```

`src/Application/SponsorshipRequests/Queries/GetMyRequests/MyRequestsVm.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetMyRequests;

public class MyRequestsVm
{
    public IList<SponsorshipRequestDto> Requests { get; set; } = [];
}
```

`src/Application/SponsorshipRequests/Queries/GetMyRequests/GetMyRequestsQueryHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetMyRequests;

public class GetMyRequestsQueryHandler : IRequestHandler<GetMyRequestsQuery, MyRequestsVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetMyRequestsQueryHandler(IApplicationDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<MyRequestsVm> Handle(GetMyRequestsQuery request, CancellationToken cancellationToken)
    {
        var requests = await _context.SponsorshipRequests
            .Where(x => x.RequestorId == _user.Id)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new SponsorshipRequestDto
            {
                Id = x.Id,
                Title = x.Title,
                Department = x.Department,
                SponsorshipType = x.SponsorshipTypeId.ToString(),
                EventName = x.EventName,
                EventDate = x.EventDate,
                RequestedAmount = x.RequestedAmount,
                Status = x.Status.ToString(),
                CreatedAt = x.CreatedAt,
                LastModifiedAt = x.LastModifiedAt
            })
            .ToListAsync(cancellationToken);

        return new MyRequestsVm { Requests = requests };
    }
}
```

**12. GetPendingApprovals Query**

`src/Application/SponsorshipRequests/Queries/GetPendingApprovals/GetPendingApprovalsQuery.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetPendingApprovals;

public record GetPendingApprovalsQuery(string ApprovalStage) : IRequest<PendingApprovalsVm>;
// ApprovalStage: "Manager" or "Finance"
```

`src/Application/SponsorshipRequests/Queries/GetPendingApprovals/PendingApprovalDto.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetPendingApprovals;

public class PendingApprovalDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string RequestorName { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string EventName { get; set; } = null!;
    public DateTime EventDate { get; set; }
    public decimal RequestedAmount { get; set; }
    public string Purpose { get; set; } = null!;
    public DateTime SubmittedAt { get; set; }
}
```

`src/Application/SponsorshipRequests/Queries/GetPendingApprovals/PendingApprovalsVm.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetPendingApprovals;

public class PendingApprovalsVm
{
    public IList<PendingApprovalDto> PendingApprovals { get; set; } = [];
}
```

`src/Application/SponsorshipRequests/Queries/GetPendingApprovals/GetPendingApprovalsQueryHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetPendingApprovals;

public class GetPendingApprovalsQueryHandler : IRequestHandler<GetPendingApprovalsQuery, PendingApprovalsVm>
{
    private readonly IApplicationDbContext _context;

    public GetPendingApprovalsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PendingApprovalsVm> Handle(GetPendingApprovalsQuery request, CancellationToken cancellationToken)
    {
        var status = request.ApprovalStage == "Manager"
            ? SponsorshipRequestStatus.PendingManagerApproval
            : SponsorshipRequestStatus.PendingFinanceReview;

        var approvals = await _context.SponsorshipRequests
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PendingApprovalDto
            {
                Id = x.Id,
                Title = x.Title,
                RequestorName = x.RequestorName,
                Department = x.Department,
                EventName = x.EventName,
                EventDate = x.EventDate,
                RequestedAmount = x.RequestedAmount,
                Purpose = x.Purpose,
                SubmittedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PendingApprovalsVm { PendingApprovals = approvals };
    }
}
```

**13. GetRequestDetail Query**

`src/Application/SponsorshipRequests/Queries/GetRequestDetail/GetRequestDetailQuery.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetRequestDetail;

public record GetRequestDetailQuery(int Id) : IRequest<RequestDetailVm>;
```

`src/Application/SponsorshipRequests/Queries/GetRequestDetail/RequestDetailVm.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetRequestDetail;

public class RequestDetailVm
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string RequestorName { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string SponsorshipType { get; set; } = null!;
    public string EventName { get; set; } = null!;
    public DateTime EventDate { get; set; }
    public decimal RequestedAmount { get; set; }
    public string Purpose { get; set; } = null!;
    public string? BusinessBenefit { get; set; }
    public string? SupportingDocumentUrl { get; set; }
    public string Status { get; set; } = null!;
    public string? ManagerApprovalRemarks { get; set; }
    public string? FinanceApprovalRemarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public IList<ApprovalHistoryDto> ApprovalHistory { get; set; } = [];
}

public class ApprovalHistoryDto
{
    public int Id { get; set; }
    public string ApproverId { get; set; } = null!;
    public string ApproverRole { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string Comments { get; set; } = null!;
    public DateTime ApprovedAt { get; set; }
}
```

`src/Application/SponsorshipRequests/Queries/GetRequestDetail/GetRequestDetailQueryHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetRequestDetail;

public class GetRequestDetailQueryHandler : IRequestHandler<GetRequestDetailQuery, RequestDetailVm>
{
    private readonly IApplicationDbContext _context;

    public GetRequestDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RequestDetailVm> Handle(GetRequestDetailQuery request, CancellationToken cancellationToken)
    {
        var sponsorshipRequest = await _context.SponsorshipRequests
            .Include(x => x.Approvals)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, sponsorshipRequest);

        return new RequestDetailVm
        {
            Id = sponsorshipRequest.Id,
            Title = sponsorshipRequest.Title,
            RequestorName = sponsorshipRequest.RequestorName,
            Department = sponsorshipRequest.Department,
            SponsorshipType = sponsorshipRequest.SponsorshipTypeId.ToString(),
            EventName = sponsorshipRequest.EventName,
            EventDate = sponsorshipRequest.EventDate,
            RequestedAmount = sponsorshipRequest.RequestedAmount,
            Purpose = sponsorshipRequest.Purpose,
            BusinessBenefit = sponsorshipRequest.BusinessBenefit,
            SupportingDocumentUrl = sponsorshipRequest.SupportingDocumentUrl,
            Status = sponsorshipRequest.Status.ToString(),
            ManagerApprovalRemarks = sponsorshipRequest.ManagerApprovalRemarks,
            FinanceApprovalRemarks = sponsorshipRequest.FinanceApprovalRemarks,
            CreatedAt = sponsorshipRequest.CreatedAt,
            LastModifiedAt = sponsorshipRequest.LastModifiedAt,
            ApprovalHistory = sponsorshipRequest.Approvals
                .OrderBy(x => x.ApprovedAt)
                .Select(x => new ApprovalHistoryDto
                {
                    Id = x.Id,
                    ApproverId = x.ApproverId,
                    ApproverRole = x.ApproverRole,
                    Action = x.Action.ToString(),
                    Comments = x.Comments,
                    ApprovedAt = x.ApprovedAt
                })
                .ToList()
        };
    }
}
```

**14. GetAllRequests Query (Admin)**

`src/Application/SponsorshipRequests/Queries/GetAllRequests/GetAllRequestsQuery.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetAllRequests;

public record GetAllRequestsQuery : IRequest<AllRequestsVm>;
```

`src/Application/SponsorshipRequests/Queries/GetAllRequests/AllRequestsVm.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetAllRequests;

public class AllRequestsVm
{
    public IList<SponsorshipRequestDto> Requests { get; set; } = [];
}

public class SponsorshipRequestDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string RequestorName { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string SponsorshipType { get; set; } = null!;
    public DateTime EventDate { get; set; }
    public decimal RequestedAmount { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
```

`src/Application/SponsorshipRequests/Queries/GetAllRequests/GetAllRequestsQueryHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetAllRequests;

public class GetAllRequestsQueryHandler : IRequestHandler<GetAllRequestsQuery, AllRequestsVm>
{
    private readonly IApplicationDbContext _context;

    public GetAllRequestsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AllRequestsVm> Handle(GetAllRequestsQuery request, CancellationToken cancellationToken)
    {
        var requests = await _context.SponsorshipRequests
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new SponsorshipRequestDto
            {
                Id = x.Id,
                Title = x.Title,
                RequestorName = x.RequestorName,
                Department = x.Department,
                SponsorshipType = x.SponsorshipTypeId.ToString(),
                EventDate = x.EventDate,
                RequestedAmount = x.RequestedAmount,
                Status = x.Status.ToString(),
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new AllRequestsVm { Requests = requests };
    }
}
```

**15. GetSponsorshipTypes Query**

`src/Application/SponsorshipRequests/Queries/GetSponsorshipTypes/GetSponsorshipTypesQuery.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetSponsorshipTypes;

public record GetSponsorshipTypesQuery : IRequest<SponsorshipTypesVm>;
```

`src/Application/SponsorshipRequests/Queries/GetSponsorshipTypes/SponsorshipTypesVm.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetSponsorshipTypes;

public class SponsorshipTypesVm
{
    public IList<SponsorshipTypeDto> SponsorshipTypes { get; set; } = [];
}

public class SponsorshipTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
}
```

`src/Application/SponsorshipRequests/Queries/GetSponsorshipTypes/GetSponsorshipTypesQueryHandler.cs`
```csharp
namespace TechAssessment.Application.SponsorshipRequests.Queries.GetSponsorshipTypes;

public class GetSponsorshipTypesQueryHandler : IRequestHandler<GetSponsorshipTypesQuery, SponsorshipTypesVm>
{
    private readonly IApplicationDbContext _context;

    public GetSponsorshipTypesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SponsorshipTypesVm> Handle(GetSponsorshipTypesQuery request, CancellationToken cancellationToken)
    {
        var types = await _context.SponsorshipTypes
            .Where(x => x.IsActive)
            .Select(x => new SponsorshipTypeDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .ToListAsync(cancellationToken);

        return new SponsorshipTypesVm { SponsorshipTypes = types };
    }
}
```

---

## STEP 3: INFRASTRUCTURE LAYER

**16. Update ApplicationDbContext.cs**

Add these DbSet properties to `src/Infrastructure/Data/ApplicationDbContext.cs`:
```csharp
public DbSet<SponsorshipRequest> SponsorshipRequests => Set<SponsorshipRequest>();
public DbSet<SponsorshipRequestApproval> SponsorshipRequestApprovals => Set<SponsorshipRequestApproval>();
public DbSet<SponsorshipType> SponsorshipTypes => Set<SponsorshipType>();
```

**17. Create Entity Configurations**

`src/Infrastructure/Data/Configurations/SponsorshipRequestConfiguration.cs`
```csharp
namespace TechAssessment.Infrastructure.Data.Configurations;

public class SponsorshipRequestConfiguration : IEntityTypeConfiguration<SponsorshipRequest>
{
    public void Configure(EntityTypeBuilder<SponsorshipRequest> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.RequestorId)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.RequestorName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Department)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.EventName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Purpose)
            .IsRequired();

        builder.Property(x => x.RequestedAmount)
            .HasPrecision(10, 2);

        builder.Property(x => x.Status)
            .HasConversion<string>();

        builder.HasMany(x => x.Approvals)
            .WithOne(x => x.Request)
            .HasForeignKey(x => x.SponsorshipRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.RequestorId);
        builder.HasIndex(x => x.CreatedAt);
    }
}
```

`src/Infrastructure/Data/Configurations/SponsorshipRequestApprovalConfiguration.cs`
```csharp
namespace TechAssessment.Infrastructure.Data.Configurations;

public class SponsorshipRequestApprovalConfiguration : IEntityTypeConfiguration<SponsorshipRequestApproval>
{
    public void Configure(EntityTypeBuilder<SponsorshipRequestApproval> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ApproverId)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.ApproverRole)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Action)
            .HasConversion<string>();

        builder.HasIndex(x => x.SponsorshipRequestId);
        builder.HasIndex(x => x.ApproverId);
    }
}
```

`src/Infrastructure/Data/Configurations/SponsorshipTypeConfiguration.cs`
```csharp
namespace TechAssessment.Infrastructure.Data.Configurations;

public class SponsorshipTypeConfiguration : IEntityTypeConfiguration<SponsorshipType>
{
    public void Configure(EntityTypeBuilder<SponsorshipType> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.HasIndex(x => x.Name)
            .IsUnique();

        // Seed default sponsorship types
        builder.HasData(
            new SponsorshipType { Id = 1, Name = "Conference", Description = "Industry conference participation", IsActive = true },
            new SponsorshipType { Id = 2, Name = "Training", Description = "Professional training and certification", IsActive = true },
            new SponsorshipType { Id = 3, Name = "Community Event", Description = "Community or charitable event", IsActive = true },
            new SponsorshipType { Id = 4, Name = "Research", Description = "Research initiative sponsorship", IsActive = true }
        );
    }
}
```

**18. Update ApplicationDbContextInitialiser.cs**

Update the `TrySeedAsync()` method to seed sponsorship requests with different statuses and update roles:

```csharp
// In ApplicationDbContextInitialiser.cs - TrySeedAsync() method
public async Task TrySeedAsync()
{
    // Default roles
    var administratorRole = new IdentityRole(Roles.Administrator);
    var managerRole = new IdentityRole(Roles.Manager);
    var financeRole = new IdentityRole(Roles.FinanceAdmin);
    var requestorRole = new IdentityRole(Roles.Requestor);
    var systemAdminRole = new IdentityRole(Roles.SystemAdmin);

    if (_roleManager.Roles.All(r => r.Name != administratorRole.Name))
    {
        await _roleManager.CreateAsync(administratorRole);
    }
    if (_roleManager.Roles.All(r => r.Name != managerRole.Name))
    {
        await _roleManager.CreateAsync(managerRole);
    }
    if (_roleManager.Roles.All(r => r.Name != financeRole.Name))
    {
        await _roleManager.CreateAsync(financeRole);
    }
    if (_roleManager.Roles.All(r => r.Name != requestorRole.Name))
    {
        await _roleManager.CreateAsync(requestorRole);
    }
    if (_roleManager.Roles.All(r => r.Name != systemAdminRole.Name))
    {
        await _roleManager.CreateAsync(systemAdminRole);
    }

    // Default users
    var administrator = new ApplicationUser { UserName = "admin@localhost", Email = "admin@localhost" };
    var manager = new ApplicationUser { UserName = "manager@localhost", Email = "manager@localhost" };
    var finance = new ApplicationUser { UserName = "finance@localhost", Email = "finance@localhost" };
    var requestor = new ApplicationUser { UserName = "requestor@localhost", Email = "requestor@localhost" };

    if (_userManager.Users.All(u => u.UserName != administrator.UserName))
    {
        await _userManager.CreateAsync(administrator, "Administrator1!");
        await _userManager.AddToRolesAsync(administrator, new[] { Roles.Administrator, Roles.SystemAdmin });
    }

    if (_userManager.Users.All(u => u.UserName != manager.UserName))
    {
        await _userManager.CreateAsync(manager, "Manager1!");
        await _userManager.AddToRoleAsync(manager, Roles.Manager);
    }

    if (_userManager.Users.All(u => u.UserName != finance.UserName))
    {
        await _userManager.CreateAsync(finance, "Finance1!");
        await _userManager.AddToRoleAsync(finance, Roles.FinanceAdmin);
    }

    if (_userManager.Users.All(u => u.UserName != requestor.UserName))
    {
        await _userManager.CreateAsync(requestor, "Requestor1!");
        await _userManager.AddToRoleAsync(requestor, Roles.Requestor);
    }
}
```

**19. Update Roles.cs**

Update `src/Domain/Constants/Roles.cs`:
```csharp
namespace TechAssessment.Domain.Constants;

public static class Roles
{
    public const string Administrator = nameof(Administrator);
    public const string Manager = nameof(Manager);
    public const string FinanceAdmin = nameof(FinanceAdmin);
    public const string Requestor = nameof(Requestor);
    public const string SystemAdmin = nameof(SystemAdmin);
}
```

---

## STEP 4: WEB ENDPOINTS

**20. Create SponsorshipRequests Endpoint**

`src/Web/Endpoints/SponsorshipRequests.cs`
```csharp
namespace TechAssessment.Web.Endpoints;

public class SponsorshipRequests : IEndpointGroup
{
    public static void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization();

        group.MapPost(CreateRequest);
        group.MapGet(GetMyRequests);
        group.MapPut(UpdateRequest, "{id}");
        group.MapPost(SubmitRequest, "{id}/submit");
        group.MapPost(CancelRequest, "{id}/cancel");
    }

    [EndpointSummary("Create Sponsorship Request")]
    public static async Task<Created<int>> CreateRequest(ISender sender, CreateSponsorshipRequestCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/sponsorship-requests/{id}", id);
    }

    [EndpointSummary("Get My Sponsorship Requests")]
    public static async Task<Ok<MyRequestsVm>> GetMyRequests(ISender sender)
    {
        var vm = await sender.Send(new GetMyRequestsQuery());
        return TypedResults.Ok(vm);
    }

    [EndpointSummary("Update Sponsorship Request")]
    public static async Task<NoContent> UpdateRequest(ISender sender, int id, UpdateSponsorshipRequestCommand command)
    {
        if (id != command.Id) return TypedResults.NoContent();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    [EndpointSummary("Submit Sponsorship Request")]
    public static async Task<NoContent> SubmitRequest(ISender sender, int id)
    {
        await sender.Send(new SubmitSponsorshipRequestCommand(id));
        return TypedResults.NoContent();
    }

    [EndpointSummary("Cancel Sponsorship Request")]
    public static async Task<NoContent> CancelRequest(ISender sender, int id, CancelRequestCommand command)
    {
        if (id != command.Id) return TypedResults.NoContent();
        await sender.Send(command);
        return TypedResults.NoContent();
    }
}
```

**21. Create ManagerApprovals Endpoint**

`src/Web/Endpoints/ManagerApprovals.cs`
```csharp
namespace TechAssessment.Web.Endpoints;

public class ManagerApprovals : IEndpointGroup
{
    public static void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization(Roles.Manager);

        group.MapGet(GetPendingApprovals);
        group.MapPost(ApproveRequest, "{id}/approve");
        group.MapPost(RejectRequest, "{id}/reject");
    }

    [EndpointSummary("Get Pending Manager Approvals")]
    public static async Task<Ok<PendingApprovalsVm>> GetPendingApprovals(ISender sender)
    {
        var vm = await sender.Send(new GetPendingApprovalsQuery("Manager"));
        return TypedResults.Ok(vm);
    }

    [EndpointSummary("Approve Request")]
    public static async Task<NoContent> ApproveRequest(ISender sender, int id, ApproveRequestCommand command)
    {
        var approveCommand = command with { Id = id, ApproverRole = "Manager" };
        await sender.Send(approveCommand);
        return TypedResults.NoContent();
    }

    [EndpointSummary("Reject Request")]
    public static async Task<NoContent> RejectRequest(ISender sender, int id, RejectRequestCommand command)
    {
        var rejectCommand = command with { Id = id, ApproverRole = "Manager" };
        await sender.Send(rejectCommand);
        return TypedResults.NoContent();
    }
}
```

**22. Create FinanceApprovals Endpoint**

`src/Web/Endpoints/FinanceApprovals.cs`
```csharp
namespace TechAssessment.Web.Endpoints;

public class FinanceApprovals : IEndpointGroup
{
    public static void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization(Roles.FinanceAdmin);

        group.MapGet(GetPendingApprovals);
        group.MapPost(ApproveRequest, "{id}/approve");
        group.MapPost(RejectRequest, "{id}/reject");
    }

    [EndpointSummary("Get Pending Finance Approvals")]
    public static async Task<Ok<PendingApprovalsVm>> GetPendingApprovals(ISender sender)
    {
        var vm = await sender.Send(new GetPendingApprovalsQuery("Finance"));
        return TypedResults.Ok(vm);
    }

    [EndpointSummary("Approve Request")]
    public static async Task<NoContent> ApproveRequest(ISender sender, int id, ApproveRequestCommand command)
    {
        var approveCommand = command with { Id = id, ApproverRole = "FinanceAdmin" };
        await sender.Send(approveCommand);
        return TypedResults.NoContent();
    }

    [EndpointSummary("Reject Request")]
    public static async Task<NoContent> RejectRequest(ISender sender, int id, RejectRequestCommand command)
    {
        var rejectCommand = command with { Id = id, ApproverRole = "FinanceAdmin" };
        await sender.Send(rejectCommand);
        return TypedResults.NoContent();
    }
}
```

**23. Create Admin Endpoints**

`src/Web/Endpoints/AdminRequests.cs`
```csharp
namespace TechAssessment.Web.Endpoints;

public class AdminRequests : IEndpointGroup
{
    public static void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization(Roles.SystemAdmin);

        group.MapGet(GetAllRequests);
        group.MapGet(GetRequestDetail, "{id}");
    }

    [EndpointSummary("Get All Requests")]
    public static async Task<Ok<AllRequestsVm>> GetAllRequests(ISender sender)
    {
        var vm = await sender.Send(new GetAllRequestsQuery());
        return TypedResults.Ok(vm);
    }

    [EndpointSummary("Get Request Detail")]
    public static async Task<Ok<RequestDetailVm>> GetRequestDetail(ISender sender, int id)
    {
        var vm = await sender.Send(new GetRequestDetailQuery(id));
        return TypedResults.Ok(vm);
    }
}
```

**24. Create SponsorshipTypes Endpoint**

`src/Web/Endpoints/SponsorshipTypes.cs`
```csharp
namespace TechAssessment.Web.Endpoints;

public class SponsorshipTypes : IEndpointGroup
{
    public static void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization();
        group.MapGet(GetTypes);
    }

    [EndpointSummary("Get Sponsorship Types")]
    public static async Task<Ok<SponsorshipTypesVm>> GetTypes(ISender sender)
    {
        var vm = await sender.Send(new GetSponsorshipTypesQuery());
        return TypedResults.Ok(vm);
    }
}
```

---

## COMPLETE - See FRONTEND_IMPLEMENTATION.md for Angular implementation
