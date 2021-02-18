using Microsoft.Owin;
using Owin;
using System.Data.SqlClient;

[assembly: OwinStartupAttribute(typeof(PlayerPortal.Startup))]
namespace PlayerPortal
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
