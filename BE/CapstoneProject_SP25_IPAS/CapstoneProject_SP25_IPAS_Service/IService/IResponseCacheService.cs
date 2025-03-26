using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IResponseCacheService
    {
        public Task SetCacheObjectAsync<T>(string key, T data, TimeSpan? expiration = null);
        public Task<T?> GetCacheObjectAsync<T>(string key);
        public Task<List<T>?> GetCacheListAsync<T>(string key);
        public Task RemoveCacheAsync(string key);
        public Task RemoveMultipleCacheAsync(List<string> keys);
        public Task RemoveCacheKeyFromGroupAsync(string groupKey, string keyToRemove);
        public Task RemoveCacheByGroupAsync(string groupKey);
        public Task AddCacheWithGroupAsync<T>(string groupKey, string key, T data, TimeSpan? expiration = null);



    }
}
