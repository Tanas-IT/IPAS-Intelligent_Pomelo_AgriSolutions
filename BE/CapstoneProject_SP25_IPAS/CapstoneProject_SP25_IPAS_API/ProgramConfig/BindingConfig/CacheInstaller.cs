using CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject;
using StackExchange.Redis;

namespace CapstoneProject_SP25_IPAS_API.ProgramConfig.BindingConfig
{
    //public static class CacheInstaller
    //{
    //    private static IDatabase _redis;

    //    public static void InstallerService(this IServiceCollection services, IConfiguration configuration)
    //    {
    //        // Bind Redis configuration correctly
    //        var redisConfiguration = new RedisConfiguration();
    //        configuration.GetSection("RedisConfiguration").Bind(redisConfiguration);

    //        services.AddStackExchangeRedisCache(options =>
    //        {
    //            options.Configuration = "localhost:6379";
    //            options.InstanceName = "";
    //        });
    //        // Register RedisConfiguration as a singleton
    //        services.AddSingleton(redisConfiguration);

    //        // Skip Redis setup if it's not enabled
    //        if (!redisConfiguration.Enabled)
    //            return;
    //        // Register the Redis connection multiplexer
    //        services.AddSingleton<IConnectionMultiplexer>(provider =>
    //            ConnectionMultiplexer.Connect(redisConfiguration.ConnectionString));

    //        // Register your custom response cache service
    //        //services.AddScoped<IResponseCacheService, ResponseCacheService>();
    //    }
    //}
}
