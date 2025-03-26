using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using StackExchange.Redis;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ResponseCacheService : IResponseCacheService
    {
        private readonly IDistributedCache _cache;
        private readonly int _defaultExpirationMinutes;
        private readonly StackExchange.Redis.IDatabase _db;
        private readonly bool _isCacheEnabled;
        public ResponseCacheService(IDistributedCache cache, IConfiguration configuration, IConnectionMultiplexer redis)
        {
            //_cache = cache;
            _defaultExpirationMinutes = configuration.GetValue<int>("RedisConfiguration:DefaultExpirationMinutes", 10);
            _isCacheEnabled = configuration.GetValue<bool>("RedisConfiguration:Enabled");
            if (_isCacheEnabled && cache != null && redis != null)
            {
                _cache = cache;
                _db = redis.GetDatabase();
            }
            //_db = redis.GetDatabase();
        }
        /// <summary>
        /// Lưu một Object vào cache
        /// </summary>
        public async Task SetCacheObjectAsync<T>(string key, T data, TimeSpan? expiration = null)
        {
            try
            {
                if (!_isCacheEnabled || _cache == null) return;
                var jsonData = JsonSerializer.Serialize(data);
                await _cache.SetStringAsync(key, jsonData, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(_defaultExpirationMinutes)
                });
            }
            catch (Exception)
            {

            }
        }


        /// <summary>
        /// Lấy một Object từ cache
        /// </summary>
        public async Task<T?> GetCacheObjectAsync<T>(string key)
        {
            try
            {
                if (!_isCacheEnabled || _cache == null) return default;
                var cachedData = await _cache.GetStringAsync(key);
                return string.IsNullOrEmpty(cachedData) ? default : JsonSerializer.Deserialize<T>(cachedData);
            }
            catch (Exception)
            {
                return default;
            }
        }

        /// <summary>
        /// Lấy danh sách List<T> từ cache
        /// </summary>
        public async Task<List<T>?> GetCacheListAsync<T>(string key)
        {
            try
            {
                if (!_isCacheEnabled || _cache == null) return default;
                var cachedData = await _cache.GetStringAsync(key);
                return string.IsNullOrEmpty(cachedData) ? null : JsonSerializer.Deserialize<List<T>>(cachedData);
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Xóa cache theo key
        /// </summary>
        public async Task RemoveCacheAsync(string key)
        {
            if (!_isCacheEnabled || _cache == null) return;
            await _cache.RemoveAsync(key);
        }

        /// <summary>
        /// Xóa nhiều key cùng lúc
        /// </summary>
        public async Task RemoveMultipleCacheAsync(List<string> keys)
        {
            if (!_isCacheEnabled || _cache == null) return;
            foreach (var key in keys)
            {
                await _cache.RemoveAsync(key);
            }
        }

        public async Task AddCacheWithGroupAsync<T>(string groupKey, string key, T data, TimeSpan? expiration = null)
        {
            if (!_isCacheEnabled || _cache == null) return;
            var jsonData = JsonSerializer.Serialize(data);
            await _cache.SetStringAsync(key, jsonData, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(15)
            });

            // Thêm key này vào danh sách Group Key
            string cacheGroupKey = $"{groupKey}:CacheKeys";
            await _db.SetAddAsync(cacheGroupKey, key);
        }

        public async Task RemoveCacheByGroupAsync(string groupKey)
        {
            if (!_isCacheEnabled || _cache == null) return;
            string cacheGroupKey = $"{groupKey}:CacheKeys";
            var relatedKeys = await _db.SetMembersAsync(cacheGroupKey);

            if (relatedKeys.Any())
            {
                foreach (var key in relatedKeys)
                {
                    await _cache.RemoveAsync(key);
                }
            }

            // Xóa luôn GroupKey
            await _cache.RemoveAsync(cacheGroupKey);
        }

        public async Task RemoveCacheKeyFromGroupAsync(string groupKey, string keyToRemove)
        {
            if (!_isCacheEnabled || _cache == null) return;
            string cacheGroupKey = $"{groupKey}:CacheKeys";

            // Kiểm tra key có tồn tại trong Redis không 
            bool exists = await _db.SetContainsAsync(cacheGroupKey, keyToRemove);
            if (exists)
            {
                await _cache.RemoveAsync(keyToRemove);
                await _db.SetRemoveAsync(cacheGroupKey, keyToRemove);
            }
        }
    }
}
