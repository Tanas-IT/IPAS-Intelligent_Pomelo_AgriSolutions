using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json;

namespace CapstoneProject_SP25_IPAS_API.ProgramConfig.BindingConfig
{
    public class CamelCaseModelBinderProvider : IModelBinderProvider
    {
        public IModelBinder GetBinder(ModelBinderProviderContext context)
        {
            return new CamelCaseModelBinder();
        }
    }

    public class CamelCaseModelBinder : IModelBinder
    {
        public async Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
                throw new ArgumentNullException(nameof(bindingContext));

            var request = bindingContext.HttpContext.Request;
            object model = Activator.CreateInstance(bindingContext.ModelType);

            // 1️⃣ Binding nếu request có form-data hoặc x-www-form-urlencoded
            if (request.HasFormContentType)
            {
                var formValues = request.Form;
                var camelCaseValues = formValues.Keys.ToDictionary(
                    key => char.ToLowerInvariant(key[0]) + key.Substring(1),
                    key => formValues[key].ToString() // Chuyển StringValues -> string
                );

                BindProperties(model, camelCaseValues);

                // Xử lý file upload
                foreach (var property in bindingContext.ModelType.GetProperties())
                {
                    if (bindingContext.HttpContext.Request.Form.Files.Any(f => f.Name == property.Name))
                    {
                        var file = bindingContext.HttpContext.Request.Form.Files.First(f => f.Name == property.Name);
                        property.SetValue(model, file);
                    }
                    else if (typeof(IFormFileCollection).IsAssignableFrom(property.PropertyType))
                    {
                        property.SetValue(model, formValues.Files);
                    }
                }
            }
            // 2️⃣ Binding nếu request có JSON body
            else if (request.ContentType?.Contains("application/json") == true)
            {
                using var reader = new StreamReader(request.Body);
                var body = await reader.ReadToEndAsync();

                if (!string.IsNullOrEmpty(body))
                {
                    var camelCaseObject = JsonSerializer.Deserialize(body, bindingContext.ModelType, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    model = camelCaseObject ?? model;
                }
            }

            bindingContext.Result = ModelBindingResult.Success(model);
        }

        private void BindProperties(object model, Dictionary<string, string> values)
        {
            foreach (var property in model.GetType().GetProperties())
            {
                string camelCaseKey = char.ToLowerInvariant(property.Name[0]) + property.Name.Substring(1);
                if (values.TryGetValue(camelCaseKey, out var value))
                {
                    try
                    {
                        object convertedValue = Convert.ChangeType(value, property.PropertyType);
                        property.SetValue(model, convertedValue);
                    }
                    catch
                    {
                        // Nếu không convert được thì bỏ qua để tránh lỗi
                    }
                }
            }
        }
    }
}
