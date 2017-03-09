using System;
using System.Runtime.Serialization;

namespace SPA.DataContract
{
    [DataContract]
    public class ProductMaster
    {
        [DataMember]
        public long Id { get; set; }
        [DataMember]
        public string ReferenceNo { get; set; }
        [DataMember]
        public string Description { get; set; }
        [DataMember]
        public Nullable<long> CommentId { get; set; }
        [DataMember]
        public long DepartmentId { get; set; }
        [DataMember]
        public long DesignLocationId { get; set; }
        [DataMember]
        public string Range { get; set; }
        [DataMember]
        public string Brand { get; set; }
        [DataMember]
        public string GenericNo { get; set; }
        [DataMember]
        public System.DateTime CreatedDate { get; set; }
        [DataMember]
        public long CreatedBy { get; set; }
        [DataMember]
        public System.DateTime UpdatedDate { get; set; }
        [DataMember]
        public long UpdatedBy { get; set; }
        [DataMember]
        public bool IsActive { get; set; }
        [DataMember]
        public long SeasonId { get; set; }
    
    }
}