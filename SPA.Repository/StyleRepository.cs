using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SPA.Data;

namespace SPA.Repository
{
    public class StyleRepository : IStyleRepository
    {
        private Entities _dbContext;
        public StyleRepository(Entities dbContext)
        {
           // _dbContext = dbContext;
        }

        public IList<ProductMaster> GetAllProdcutMasters()
        {
            var query = from bd in _dbContext.ProductMasters
                        select bd;
            var result = query.ToList();
            return result;
        }
    }
}
