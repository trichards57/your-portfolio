using System;

namespace PortfolioServer.Model
{
    public class Shift
    {
        public string CrewMate { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan Duration { get; set; }
        public string Event { get; set; }
        public string Id { get; set; }
        public string Location { get; set; }
        public RoleType Role { get; set; }
        public string UserId { get; set; }
    }
}
