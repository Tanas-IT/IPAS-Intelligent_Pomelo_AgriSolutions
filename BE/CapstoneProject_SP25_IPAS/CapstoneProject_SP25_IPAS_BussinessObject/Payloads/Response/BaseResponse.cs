namespace CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response
{
    public class BaseResponse
    {
        public int StatusCode { get; set; }
        public string? Message { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }

        public object? Data { get; set; } = null!;
        public IDictionary<string, string[]> Errors { get; set; } = null!;
    }
}
