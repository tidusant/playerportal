using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using PlayerPortal.Models;
using System.Configuration;
using System.Security.Cryptography;
using System.Text;
using System.Globalization;
using WalletAPI.Casino.QuantumBL;
using WalletAPI.Casino.QuantumUtility;
using System.Reflection;

namespace PlayerPortal.Controllers
{
    // [Authorize]
    public class AccountController : Controller
    {
        //public AccountController()
        //    : this(new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext())))
        //{
        //}
        public AccountController()
            //: this(new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext())))
        {
        }
        public AccountController(UserManager<ApplicationUser> userManager)
        {
            UserManager = userManager;
        }

        public UserManager<ApplicationUser> UserManager { get; private set; }

        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        //
        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(LoginViewModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindAsync(model.UserName, model.Password);
                if (user != null)
                {
                    await SignInAsync(user, model.RememberMe);
                    return RedirectToLocal(returnUrl);
                }
                else
                {
                    ModelState.AddModelError("", "Invalid username or password.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/Register
        [AllowAnonymous]
        public ActionResult Register()
        {
            return View();
        }

        // GET: /Account/Register
        [AllowAnonymous]
        public ActionResult AccountManagement()
        {
            return View();
        }


        // method to Get secret key from database according to their CafeID
        private string CafeWiseSecertKey(int CafeID)
        {
            string Key = string.Empty;
            try
            {
                TraceLog.logger.LogInfo(typeof(string), string.Format(CultureInfo.InvariantCulture, "Called {2} function ::{0} {1}.", DateTime.Now.ToShortDateString(), DateTime.Now.ToShortTimeString(), MethodBase.GetCurrentMethod().Name));
                CafeBAL objCafe = new CafeBAL();
                // Key = objCafe.GetCafeSecertKey(CafeID);
                TraceLog.logger.LogInfo(typeof(string), string.Format(CultureInfo.InvariantCulture, "END {2} function ::{0} {1}.", DateTime.Now.ToShortDateString(), DateTime.Now.ToShortTimeString(), MethodBase.GetCurrentMethod().Name));
            }
            catch (Exception ex)
            {
                // TraceLog.logger.LogInfo(typeof(string), );
            }
            return Key;
        }


        [HttpPost]
        public JsonResult LoginPlayer(RequestLogin obj)
        {
            ResLogin Res = new ResLogin();
            string EncryptSecretKey = string.Empty;
            string CafeID = string.Empty;
            //TraceLog.logger.LogInfo(typeof(string), string.Format(CultureInfo.InvariantCulture, "Called {2} function ::{0} {1}.", DateTime.Now.ToShortDateString(), DateTime.Now.ToShortTimeString(), MethodBase.GetCurrentMethod().Name));
            try
            {
                string SecretKey = ConfigurationManager.AppSettings.Get("Secret");
                CafeID = ConfigurationManager.AppSettings.Get("CafeID");
                //  TraceLog.logger.LogInfo(typeof(string), "CafeID: - " + CafeID);
                // string SecretKey = CafeWiseSecertKey(Convert.ToInt16(CafeID));
                //TraceLog.logger.LogInfo(typeof(string), "SecretKey: - " + SecretKey);

                byte[] temp;
                SHA1 sha = new SHA1CryptoServiceProvider();
                // This is one implementation of the abstract class SHA1.
                var json = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
                temp = sha.ComputeHash(Encoding.UTF8.GetBytes(Encryption.Encrypt(SecretKey) + json));
                //temp = sha.ComputeHash(Encoding.UTF8.GetBytes(SecretKey + json));
                EncryptSecretKey = String.Join("", temp.Select(p => p.ToString("x2")).ToArray());

                //TraceLog.logger.LogInfo(typeof(string), "EncryptSecretKey: - " + EncryptSecretKey);
                // Res.Key = EncryptSecretKey;
                // Res.TerminalIP = GetIPAddress();

            }
            catch (Exception ex)
            {

            }
            return Json(new { Key = EncryptSecretKey, TerminalIP = GetIPAddress(), CafeID = CafeID });
        }
        


        [HttpPost]
        public string GetPlayerDetails(RequestGetPlayerSetails obj)
        {
            string EncryptSecretKey = string.Empty;
            string CafeID = ConfigurationManager.AppSettings.Get("CafeID");
            string SecretKey = ConfigurationManager.AppSettings.Get("Secret");
            byte[] temp;
            SHA1 sha = new SHA1CryptoServiceProvider();
            // This is one implementation of the abstract class SHA1.
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            temp = sha.ComputeHash(Encoding.UTF8.GetBytes(Encryption.Encrypt(SecretKey) + json));
            //temp = sha.ComputeHash(Encoding.UTF8.GetBytes(SecretKey + json));
            EncryptSecretKey = String.Join("", temp.Select(p => p.ToString("x2")).ToArray());

            return EncryptSecretKey;
        }

        [HttpPost]
        public string LogoutPlayer(RequestLogoutPlayer obj)
        {
            string EncryptSecretKey = string.Empty;
            string CafeID = ConfigurationManager.AppSettings.Get("CafeID");
            string SecretKey = ConfigurationManager.AppSettings.Get("Secret");
            byte[] temp;
            SHA1 sha = new SHA1CryptoServiceProvider();
            // This is one implementation of the abstract class SHA1.
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            temp = sha.ComputeHash(Encoding.UTF8.GetBytes(Encryption.Encrypt(SecretKey) + json));
            //temp = sha.ComputeHash(Encoding.UTF8.GetBytes(SecretKey + json));
            EncryptSecretKey = String.Join("", temp.Select(p => p.ToString("x2")).ToArray());
            return EncryptSecretKey;
            
        }

        [HttpPost]
        public string Launch(RequestLaunchGame obj)
        {
            string EncryptSecretKey = string.Empty;
            string CafeID = ConfigurationManager.AppSettings.Get("CafeID");
            string SecretKey = ConfigurationManager.AppSettings.Get("Secret");
            byte[] temp;
            SHA1 sha = new SHA1CryptoServiceProvider();
            // This is one implementation of the abstract class SHA1.
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            temp = sha.ComputeHash(Encoding.UTF8.GetBytes(Encryption.Encrypt(SecretKey) + json));
            //temp = sha.ComputeHash(Encoding.UTF8.GetBytes(SecretKey + json));
            EncryptSecretKey = String.Join("", temp.Select(p => p.ToString("x2")).ToArray());
            return EncryptSecretKey;
        }

        [HttpPost]
        public string GetPlayerTransaction(RequestPlayerTrans obj)
        {
            string EncryptSecretKey = string.Empty;
            string CafeID = ConfigurationManager.AppSettings.Get("CafeID");
            string SecretKey = ConfigurationManager.AppSettings.Get("Secret");
            byte[] temp;
            SHA1 sha = new SHA1CryptoServiceProvider();
            // This is one implementation of the abstract class SHA1.
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            temp = sha.ComputeHash(Encoding.UTF8.GetBytes(Encryption.Encrypt(SecretKey) + json));
            //temp = sha.ComputeHash(Encoding.UTF8.GetBytes(SecretKey + json));
            EncryptSecretKey = String.Join("", temp.Select(p => p.ToString("x2")).ToArray());

            return EncryptSecretKey;
        }


        [HttpPost]
        public string PlayerEditDetails(PlayerEditReq obj)
        {
            string EncryptSecretKey = string.Empty;
            string CafeID = ConfigurationManager.AppSettings.Get("CafeID");
            string SecretKey = ConfigurationManager.AppSettings.Get("Secret");
            byte[] temp;
            SHA1 sha = new SHA1CryptoServiceProvider();
            // This is one implementation of the abstract class SHA1.
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            temp = sha.ComputeHash(Encoding.UTF8.GetBytes(Encryption.Encrypt(SecretKey) + json));
            //temp = sha.ComputeHash(Encoding.UTF8.GetBytes(SecretKey + json));
            EncryptSecretKey = String.Join("", temp.Select(p => p.ToString("x2")).ToArray());

            return EncryptSecretKey;
        }

        protected string GetIPAddress()
        {
            System.Web.HttpContext context = System.Web.HttpContext.Current;
            string ipAddress = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];

            if (!string.IsNullOrEmpty(ipAddress))
            {
                string[] addresses = ipAddress.Split(',');
                if (addresses.Length != 0)
                {
                    return addresses[0];
                }
            }

            return context.Request.ServerVariables["REMOTE_ADDR"];
        }

        public class PlayerEditReq
        {
            public Int64 PlayerID { get; set; }
            public string Name { get; set; }
            public string LastName { get; set; }
            public string Employer { get; set; }
            public string Phone { get; set; }
            public string PhoneNumber { get; set; }
            public string EmailId { get; set; }
            public string Zipcode { get; set; }
            public string AddressLine1 { get; set; }
            public string AddressLine2 { get; set; }
            public string AddressLine3 { get; set; }
            public string Country { get; set; }
            public string Address { get; set; }
            public string City { get; set; }
            public string State { get; set; }
            public string AlternatePhone { get; set; }
        }

        public class RequestLaunchGame
        {
            public string OTP { get; set; }
            public string CardNumber { get; set; }
            public string Currency { get; set; }
            public string UserName { get; set; }

        }

        public class RequestPlayerTrans
        {
            public string StartDate { get; set; }
            public string EndDate { get; set; }
            public string CardNumber { get; set; }


        }

        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser() { UserName = model.UserName };
                var result = await UserManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {
                    await SignInAsync(user, isPersistent: false);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    AddErrors(result);
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // POST: /Account/Disassociate
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Disassociate(string loginProvider, string providerKey)
        {
            ManageMessageId? message = null;
            IdentityResult result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId(), new UserLoginInfo(loginProvider, providerKey));
            if (result.Succeeded)
            {
                message = ManageMessageId.RemoveLoginSuccess;
            }
            else
            {
                message = ManageMessageId.Error;
            }
            return RedirectToAction("Manage", new { Message = message });
        }

        //
        // GET: /Account/Manage
        public ActionResult Manage(ManageMessageId? message)
        {
            ViewBag.StatusMessage =
                message == ManageMessageId.ChangePasswordSuccess ? "Your password has been changed."
                : message == ManageMessageId.SetPasswordSuccess ? "Your password has been set."
                : message == ManageMessageId.RemoveLoginSuccess ? "The external login was removed."
                : message == ManageMessageId.Error ? "An error has occurred."
                : "";
            ViewBag.HasLocalPassword = HasPassword();
            ViewBag.ReturnUrl = Url.Action("Manage");
            return View();
        }

        //
        // POST: /Account/Manage
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Manage(ManageUserViewModel model)
        {
            bool hasPassword = HasPassword();
            ViewBag.HasLocalPassword = hasPassword;
            ViewBag.ReturnUrl = Url.Action("Manage");
            if (hasPassword)
            {
                if (ModelState.IsValid)
                {
                    IdentityResult result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId(), model.OldPassword, model.NewPassword);
                    if (result.Succeeded)
                    {
                        return RedirectToAction("Manage", new { Message = ManageMessageId.ChangePasswordSuccess });
                    }
                    else
                    {
                        AddErrors(result);
                    }
                }
            }
            else
            {
                // User does not have a password so remove any validation errors caused by a missing OldPassword field
                ModelState state = ModelState["OldPassword"];
                if (state != null)
                {
                    state.Errors.Clear();
                }

                if (ModelState.IsValid)
                {
                    IdentityResult result = await UserManager.AddPasswordAsync(User.Identity.GetUserId(), model.NewPassword);
                    if (result.Succeeded)
                    {
                        return RedirectToAction("Manage", new { Message = ManageMessageId.SetPasswordSuccess });
                    }
                    else
                    {
                        AddErrors(result);
                    }
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // POST: /Account/ExternalLogin
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ExternalLogin(string provider, string returnUrl)
        {
            // Request a redirect to the external login provider
            return new ChallengeResult(provider, Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }));
        }

        //
        // GET: /Account/ExternalLoginCallback
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl)
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (loginInfo == null)
            {
                return RedirectToAction("Login");
            }

            // Sign in the user with this external login provider if the user already has a login
            var user = await UserManager.FindAsync(loginInfo.Login);
            if (user != null)
            {
                await SignInAsync(user, isPersistent: false);
                return RedirectToLocal(returnUrl);
            }
            else
            {
                // If the user does not have an account, then prompt the user to create an account
                ViewBag.ReturnUrl = returnUrl;
                ViewBag.LoginProvider = loginInfo.Login.LoginProvider;
                return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel { UserName = loginInfo.DefaultUserName });
            }
        }

        //
        // POST: /Account/LinkLogin
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LinkLogin(string provider)
        {
            // Request a redirect to the external login provider to link a login for the current user
            return new ChallengeResult(provider, Url.Action("LinkLoginCallback", "Account"), User.Identity.GetUserId());
        }

        //
        // GET: /Account/LinkLoginCallback
        public async Task<ActionResult> LinkLoginCallback()
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync(XsrfKey, User.Identity.GetUserId());
            if (loginInfo == null)
            {
                return RedirectToAction("Manage", new { Message = ManageMessageId.Error });
            }
            var result = await UserManager.AddLoginAsync(User.Identity.GetUserId(), loginInfo.Login);
            if (result.Succeeded)
            {
                return RedirectToAction("Manage");
            }
            return RedirectToAction("Manage", new { Message = ManageMessageId.Error });
        }

        //
        // POST: /Account/ExternalLoginConfirmation
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ExternalLoginConfirmation(ExternalLoginConfirmationViewModel model, string returnUrl)
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Manage");
            }

            if (ModelState.IsValid)
            {
                // Get the information about the user from the external login provider
                var info = await AuthenticationManager.GetExternalLoginInfoAsync();
                if (info == null)
                {
                    return View("ExternalLoginFailure");
                }
                var user = new ApplicationUser() { UserName = model.UserName };
                var result = await UserManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    result = await UserManager.AddLoginAsync(user.Id, info.Login);
                    if (result.Succeeded)
                    {
                        await SignInAsync(user, isPersistent: false);
                        return RedirectToLocal(returnUrl);
                    }
                }
                AddErrors(result);
            }

            ViewBag.ReturnUrl = returnUrl;
            return View(model);
        }

        //
        // POST: /Account/LogOff
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            AuthenticationManager.SignOut();
            return RedirectToAction("Index", "Home");
        }

        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        [ChildActionOnly]
        public ActionResult RemoveAccountList()
        {
            var linkedAccounts = UserManager.GetLogins(User.Identity.GetUserId());
            ViewBag.ShowRemoveButton = HasPassword() || linkedAccounts.Count > 1;
            return (ActionResult)PartialView("_RemoveAccountPartial", linkedAccounts);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && UserManager != null)
            {
                UserManager.Dispose();
                UserManager = null;
            }
            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private async Task SignInAsync(ApplicationUser user, bool isPersistent)
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);
            var identity = await UserManager.CreateIdentityAsync(user, DefaultAuthenticationTypes.ApplicationCookie);
            AuthenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = isPersistent }, identity);
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private bool HasPassword()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user != null)
            {
                return user.PasswordHash != null;
            }
            return false;
        }

        public enum ManageMessageId
        {
            ChangePasswordSuccess,
            SetPasswordSuccess,
            RemoveLoginSuccess,
            Error
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }

        private class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties() { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion


        public class RequestLogin
        {

            public string UserName { get; set; }
            public string Password { get; set; }


        }

        public class RequestLogoutPlayer
        {

            public string PlayerID { get; set; }
            public string OTP { get; set; }


        }

        public class RequestGetPlayerSetails
        {

            public string CardNumber { get; set; }

        }

        public class ResLogin
        {

            public bool Wassuccessful { get; set; }
            public string Key { get; set; }

            public string TerminalIP { get; set; }
        }

    }
}