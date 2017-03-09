using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PLM.Data;

namespace PLM.Repository
{
    public interface IStyleRepository
    {
        IList<ProductMaster> GetAllProdcutMasters();
    }
}
