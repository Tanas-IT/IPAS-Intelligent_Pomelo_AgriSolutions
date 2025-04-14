using CoenM.ImageHash;
using CoenM.ImageHash.HashAlgorithms;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service.CompareImage
{
    public class ImageHashComparerService : IImageHashCompareService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ImageHashComparerService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<ulong> GetHashFromUrlAsync(string url)
        {
            using var client = _httpClientFactory.CreateClient();
            var stream = await client.GetStreamAsync(url);
            using var image = await Image.LoadAsync<Rgba32>(stream);
            var hasher = new AverageHash();
            var hash = hasher.Hash(image);
            return hash;
        }

        public double CalculateDistance(ulong hash1, ulong hash2)
        {
            return CompareHash.Similarity(hash1, hash2);
        }
    }
}
