using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SPA.Data;

namespace SPA.Repository
{
    public interface IStyleRepository
    {
        IList<ProductMaster> GetAllProdcutMasters();
    }
}
