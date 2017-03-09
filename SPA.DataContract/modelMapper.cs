using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SPA.DataContract;

namespace mySPAwebApp
{
    public class modelMapper
    {
        //Common
        public static T Map<S, T>(S source)
        {
            Mapper.CreateMap<S, T>();
            return Mapper.Map<T>(source);
        }

        //ProductMaster
        public static SPA.Data.ProductMaster Map(ProductMaster productMaster)
        {
            if (productMaster == null) return null;

            return new SPA.Data.ProductMaster()
            {
                Id = productMaster.Id,
                ReferenceNo = productMaster.ReferenceNo,
                CommentId = productMaster.CommentId,
                DepartmentId = productMaster.DepartmentId,
                DesignLocationId = productMaster.DesignLocationId,
                Range = productMaster.Range,
                Brand = productMaster.Brand,
                GenericNo = productMaster.GenericNo,
                CreatedDate = productMaster.CreatedDate,
                CreatedBy = productMaster.CreatedBy,
                UpdatedDate = productMaster.UpdatedDate,
                UpdatedBy = productMaster.UpdatedBy,
                IsActive = productMaster.IsActive,
                SeasonId = productMaster.SeasonId,
                Description = productMaster.Description,
            };
        }

        public static SPA.DataContract.ProductMaster Map(SPA.Data.ProductMaster productMaster)
        {
            if (productMaster == null) return null;

            return new SPA.DataContract.ProductMaster()
            {
                Id = productMaster.Id,
                ReferenceNo = productMaster.ReferenceNo,
                CommentId = productMaster.CommentId,
                DepartmentId = productMaster.DepartmentId,
                DesignLocationId = productMaster.DesignLocationId,
                Range = productMaster.Range,
                Brand = productMaster.Brand,
                GenericNo = productMaster.GenericNo,
                CreatedDate = productMaster.CreatedDate,
                CreatedBy = productMaster.CreatedBy,
                UpdatedDate = productMaster.UpdatedDate,
                UpdatedBy = productMaster.UpdatedBy,
                IsActive = productMaster.IsActive,
                SeasonId = productMaster.SeasonId,
                Description = productMaster.Description
            };
        }
    }
}