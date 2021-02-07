using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Mvc;
using WalletAPI.Casino.QuantumBL.LocationServiceBAL;
using WalletAPI.Casino.QuantumModels.LocationServiceModels;
using WalletAPI.Casino.QuantumUtility;

namespace PlayerPortal.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            // string data = GetCafeGameImageInfo(30, "Top Rated");
            return View();

        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        public ActionResult Lobby()
        {
            return View();
        }
        [HttpPost]
        public JsonResult GetCafeGameImageInfo()
       {
            string CafeID = string.Empty;
            //TraceLog.logger.LogInfo(typeof(string), string.Format(CultureInfo.InvariantCulture, "Called {2} function ::{0} {1}.", DateTime.Now.ToShortDateString(), DateTime.Now.ToShortTimeString(), MethodBase.GetCurrentMethod().Name));
            try
            {
                CafeID = ConfigurationManager.AppSettings.Get("CafeID");
                List<CafeGameBO> listCafeGameBO = new List<CafeGameBO>();
                CafeGameBAL objCafeGameBAL = new CafeGameBAL();
                //listCafeGameBO = objCafeGameBAL.GetCafeGameImageList(Convert.ToInt32(CafeID));
                var cafeGameImgList = new List<CafeGameBO>();
                foreach (var item in listCafeGameBO)
                {
                    var imgSrc = string.Empty;
                    if (item.GameImage != null)
                    {
                        string base64String = Convert.ToBase64String(item.GameImage);
                        imgSrc = string.Format("data:image/png;base64," + base64String);
                    }
                    var result = new CafeGameBO();
                    result.CafeID = item.CafeID;
                    result.Category = item.Category;
                    result.strGameImage = imgSrc;
                    result.Sequence = item.Sequence;
                    result.ImageLink = item.ImageLink;
                    result.IsActive = item.IsActive;
                    cafeGameImgList.Add(result);
                }
                return Json(cafeGameImgList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}