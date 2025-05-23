﻿using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface ISystemConfigRepository
    {
        Task<List<SystemConfiguration>> GetAllActiveConfigsAsync(string key);
        public Task<T> GetConfigValue<T>(string configKey, T defaultValue);
        public Task<List<SystemConfiguration>> GetAllConfigsByGroupNameAsync(string groupName);
       

    }
}
