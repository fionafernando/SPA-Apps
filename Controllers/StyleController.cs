using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using PLM.DataContract;
using PLM.DataServices;

namespace myPLMwebApp.Controllers
{
    public class StyleController : ApiController
    {
        [System.Web.Http.AcceptVerbs("GET"),
        ActionName("GetAllProdcutMasters")]
        public IList<ProductMaster> GetAllProdcutMasters()
        {
            var list = new StyleDataService().GetAllProdcutMasters();
            var prodMasList = new List<ProductMaster>();
            foreach (var prodMas in list)
            {
                prodMasList.Add(modelMapper.Map(prodMas));
            }
            return prodMasList;
        }

        [System.Web.Http.AcceptVerbs("GET"),
        ActionName("SaveProdcutMaster")]
        public IList<ProductMaster> SaveProdcutMaster()
        {
            var list = new StyleDataService().GetAllProdcutMasters();
            var prodMasList = new List<ProductMaster>();
            foreach (var prodMas in list)
            {
                prodMasList.Add(modelMapper.Map(prodMas));
            }
            return prodMasList;
        }
    }
}