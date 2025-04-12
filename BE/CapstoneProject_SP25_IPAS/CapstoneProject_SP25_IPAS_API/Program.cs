using CapstoneProject_SP25_IPAS_API.ProgramConfig;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using CapstoneProject_SP25_IPAS_Common.Mail;
using CapstoneProject_SP25_IPAS_API.Middleware;
using CapstoneProject_SP25_IPAS_Common.Utils;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Features;
using CapstoneProject_SP25_IPAS_API.ProgramConfig.BindingConfig;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Service;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5242");

builder.Services.ConfigureServices(builder.Configuration);
builder.Services.InstallerService(builder.Configuration);
builder.Services.AddDbContext<IpasContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));

});

builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "IPAS API", Version = "v1" });

    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    }); option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

//Config Jwt Token
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:SecretKey"])),
        ClockSkew = TimeSpan.Zero
    };
})
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
});

// Add CORS
//builder.Services.AddCors(p => p.AddPolicy("Cors", policy =>
//{
//    policy.WithOrigins("*")
//          .AllowAnyHeader()
//          .AllowAnyMethod();
//}));
builder.Services.AddCors(p => p.AddPolicy("Cors", policy =>
{
    policy.WithOrigins("http://localhost:5173")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials();
}));
// add  json option to avoid cycle when return
//builder.Services.AddControllers().AddJsonOptions(options =>
//{
//    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
//    options.JsonSerializerOptions.WriteIndented = false;
//});
builder.Services.AddControllers()
//    (options =>
//{
//    options.ModelBinderProviders.Insert(0, new CamelCaseModelBinderProvider());
//})
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;

    });
// add mail settings
builder.Services.Configure<MailSetting>(builder.Configuration.GetSection("MailSettings"));
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));


// Config WebSocket
var webSocketOptions = new WebSocketOptions()
{
    KeepAliveInterval = TimeSpan.FromMinutes(5),
};
// filter check farm expired
builder.Services.AddScoped<FarmExpiredFilter>();

var app = builder.Build();


// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Cors");
app.UseMiddleware<TokenValidationMiddleware>();
app.UseMiddleware<AccountStatusMiddleware>();
app.UseWebSockets(webSocketOptions);
app.UseMiddleware<WebSocketMiddleware>();

//app.UseMiddleware<AuthorizeMiddleware>();
//app.UseMiddleware<FarmExpiredMiddleware>();
//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
