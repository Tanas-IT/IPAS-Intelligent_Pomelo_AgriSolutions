using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class WeatherNotificationService : IWeatherNotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        //private readonly IWebSocketService _webSocketService;
        private readonly ILogger<WeatherNotificationService> _logger;

        public WeatherNotificationService(IUnitOfWork unitOfWork, /*IWebSocketService webSocketService, */ILogger<WeatherNotificationService> logger)
        {
            _unitOfWork = unitOfWork;
            //_webSocketService = webSocketService;
            _logger = logger;
        }

        public async Task ProcessWeatherWarningsAsync(int farmId, List<string> warnings)
        {
            var users = await _unitOfWork.UserFarmRepository.GetUserOfFarm(farmId);
            foreach (var user in users)
            {
                //if (warnings.Any(w => w.Contains("Extreme Weather Warning")))
                //{
                //    await _webSocketService.SendRealTimeNotification(user.Id, warnings);
                //}
                //else 
                if (user.Role!.RoleName!.Equals(RoleEnum.OWNER.ToString(), StringComparison.OrdinalIgnoreCase) || user.Role!.RoleName!.Equals(RoleEnum.MANAGER.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    //await _unitOfWork.NotificationRepository.CreateWeatherNotification(user.Id, warnings);
                    Console.WriteLine($"{user.Role.RoleName}-{string.Join(",",warnings)}");
                }
                else if (user.Role!.RoleName!.Equals(RoleEnum.EMPLOYEE.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    //var relevantWarnings = warnings.Where(w => _unitOfWork.WorkLogRepository.IsWorkAffected(user.Id, w)).ToList();
                    //if (relevantWarnings.Any())
                    //{
                    //    await _unitOfWork.NotificationRepository.CreateWeatherNotification(user.Id, relevantWarnings);
                    //}
                    Console.WriteLine($"{user.Role.RoleName}-{string.Join(", ",warnings)}");
                }
            }
            await _unitOfWork.SaveAsync();
        }
    }
}