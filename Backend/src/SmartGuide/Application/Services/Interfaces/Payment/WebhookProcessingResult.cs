using System;
using System.Collections.Generic;
using System.Text;


namespace Application.Services.Interfaces.Payment
{
    public enum WebhookProcessingResult
    {
        Processed,
        AlreadyProcessed,
        InvalidSignature,
        Malformed
    }
}

