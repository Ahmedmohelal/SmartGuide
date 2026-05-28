using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Common.Pagination
{
    public class AuditLogSpecParams
    : BaseSpecParams
    {
        public string? AdminId { get; set; }

        public string? Action { get; set; }

        public string? EntityType { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }
    }
}
