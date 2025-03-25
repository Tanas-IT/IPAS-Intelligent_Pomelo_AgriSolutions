using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using StackExchange.Redis;

namespace CapstoneProject_SP25_IPAS_API.ProgramConfig.BindingConfig
{
    public static class CacheInstaller
    {

        public static void InstallerService(this IServiceCollection services, IConfiguration configuration)
        {
            // Bind Redis configuration correctly
            var redisConfiguration = new RedisConfiguration();
            configuration.GetSection("RedisConfiguration").Bind(redisConfiguration);

            if (!redisConfiguration.Enabled)
                return;

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = $"{redisConfiguration.ConnectionString}:{redisConfiguration.Port},password={redisConfiguration.Password},ssl=True,abortConnect=False";
                options.InstanceName = redisConfiguration.InstanceName;
            });
            // Register RedisConfiguration as a singleton
            services.AddSingleton(redisConfiguration);

            // Skip Redis setup if it's not enabled
            if (!redisConfiguration.Enabled)
                return;
            // Register the Redis connection multiplexer
            services.AddSingleton<IConnectionMultiplexer>(provider =>
                ConnectionMultiplexer.Connect(redisConfiguration.ConnectionString));

            // Register your custom response cache service
            //services.AddScoped<IResponseCacheService, ResponseCacheService>();
        }
    }
}
