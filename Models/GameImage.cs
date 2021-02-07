using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PlayerPortal.Models
{
    public class GameImage
    {
        public int GameID { get; set; }
        public int CafeID { get; set; }
        public bool? IsActive { get; set; }
        public string Location { get; set; }
        public string ImageLink { get; set; }
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public int Sequence { get; set; }

        public string Category { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}