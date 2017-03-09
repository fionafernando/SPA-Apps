using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PLM.Data;

namespace PLM.Repository
{
    public class StyleRepository : IStyleRepository
    {
        private PLMQA_8181Entities _dbContext;
        public StyleRepository(PLMQA_8181Entities dbContext)
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
