using Microsoft.Owin;
using Owin;

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
