using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IExcelReaderService
    {
        public Task<List<T>> ReadCsvFileAsync<T>(IFormFile file, string delimiter = ",", Encoding? encoding = null);

        //public Task<(List<DuplicateError<T>> DuplicateErrors, List<T> ValidItems)> FindDuplicatesWithErrorsAsync<T>( List<T> importList, Func<T, object> uniqueKeySelector, Func<List<T>, Task<List<T>>> dbQueryFunc, Func<T, T, bool> isSameEntity, bool skipDuplicate = false);
        //public Task<(List<DuplicateError<T>> DuplicateErrors, List<T> ValidItems)>
        //       FindDuplicatesWithErrorsAsync<T>(
        //       List<T> importList,
        //       Func<T, object> uniqueKeySelector
        //  //Func<List<T>, Task<List<T>>> dbQueryFunc,
        //  //Func<T, T, bool> isSameEntity,
        //  //bool skipDuplicate = false
        //  );

        public Task<(List<DuplicateError<T>> DuplicateErrors, List<T> ValidItems)>
FindDuplicatesInFileAsync<T>(List<T> importList);
        

    }
}
