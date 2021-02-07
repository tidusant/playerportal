using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PlayerPortal.Controllers
{
    public class GamesController : Controller
    {
        //
        // GET: /Game/
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Casino()
        {
            return View();
        }

        public ActionResult Lotto()
        {
            return View();
        }
    }
}