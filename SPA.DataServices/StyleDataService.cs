using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Text;
using System.Threading.Tasks;
using SPA.Data;
using System.Linq;

namespace SPA.DataServices
{
    public class StyleDataService
    {
        // private IUnitOfWork _unitOfWork;
        public StyleDataService()
        {
            //_unitOfWork = unitOfWork;
        }

        public IList<ProductMaster> GetAllProdcutMasters()
        {
            using (var context = new PLMQA_8181Entities())
            {
                var query = from p in context.ProductMasters
                            select p;

                return query.ToList();
            }
           
        }
    }

}
