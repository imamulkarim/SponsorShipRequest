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
