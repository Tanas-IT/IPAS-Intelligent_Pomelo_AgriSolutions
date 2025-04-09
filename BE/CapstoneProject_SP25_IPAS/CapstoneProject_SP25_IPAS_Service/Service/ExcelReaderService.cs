using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using CapstoneProject_SP25_IPAS_Service.IService;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Formats.Asn1;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ExcelReaderService : IExcelReaderService
    {
        //public async Task<List<T>> ReadCsvFileAsync<T>(IFormFile file, string delimiter = ",", Encoding? encoding = null)
        //{
        //    if (file == null || file.Length == 0)
        //        throw new ArgumentException("File is empty or null.");

        //    encoding ??= Encoding.UTF8;

        //    using var stream = file.OpenReadStream();
        //    using var reader = new StreamReader(stream, encoding);
        //    using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        //    {
        //        HasHeaderRecord = true,
        //        Delimiter = delimiter,
        //        IgnoreBlankLines = true,
        //        TrimOptions = TrimOptions.Trim,
        //        HeaderValidated = null,
        //        MissingFieldFound = null
        //    });

        //    var records = csv.GetRecords<T>().ToList();
        //    stream.Close();
        //    reader.Close();
        //    return records;
        //}

        public async Task<List<T>> ReadCsvFileAsync<T>(IFormFile file, string delimiter = ",", Encoding? encoding = null)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null.");

            encoding ??= Encoding.UTF8;

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream, encoding);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,  // Đọc header
                Delimiter = delimiter,
                IgnoreBlankLines = true,
                TrimOptions = TrimOptions.Trim,
                HeaderValidated = null,  // Không validate header tự động
                MissingFieldFound = null // Không báo lỗi nếu thiếu trường
            });

            var records = new List<T>();
            var errorMessages = new List<string>();

            try
            {
                // Đọc header
                csv.Read();
                csv.ReadHeader();
                var headers = csv.HeaderRecord ?? [];

                // Lấy danh sách property của object T
                var properties = typeof(T).GetProperties().Select(p => p.Name).ToList();

                // Kiểm tra header có đúng không
                var missingHeaders = properties.Except(headers, StringComparer.OrdinalIgnoreCase).ToList();
                if (missingHeaders.Any())
                {
                    throw new Exception($"CSV file is missing headers: {string.Join(", ", missingHeaders)}");
                }

                // Đọc từng dòng
                while (csv.Read())
                {
                    try
                    {
                        var record = Activator.CreateInstance<T>();

                        foreach (var property in typeof(T).GetProperties())
                        {
                            var columnName = property.Name; // Tên cột trong file CSV
                            try
                            {
                                // Thử lấy dữ liệu của cột này
                                var value = csv.GetField(property.PropertyType, columnName);
                                property.SetValue(record, value);
                            }
                            catch (Exception)
                            {
                                errorMessages.Add($"Column '{columnName}' in file excel has wrong type of data, please check again. (Row {csv.Parser.Row})");
                            }
                        }

                        records.Add(record);
                    }
                    catch (Exception ex)
                    {
                        errorMessages.Add($"Error parsing row {csv.Parser.Row}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error reading CSV file: {ex.Message}", ex);
            }

            // Nếu có lỗi thì throw exception với danh sách lỗi
            if (errorMessages.Any())
            {
                throw new Exception(string.Join("\n", errorMessages));
            }

            return records;
        }

        public async Task<(byte[] FileBytes, string FileName, string ContentType)> ExportToCsvAsync<T>(List<T> data, string fileName = "export.csv")
        {
            if (!fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                fileName += ".csv";
            }
            using var memoryStream = new MemoryStream();
            using var streamWriter = new StreamWriter(memoryStream, Encoding.UTF8);
            using var csvWriter = new CsvWriter(streamWriter, CultureInfo.InvariantCulture);
            var properties = typeof(T).GetProperties()
                .Where(p => Attribute.IsDefined(p, typeof(CsvExportAttribute)))
                .Select(p => new
                {
                    Property = p,
                    DisplayName = p.GetCustomAttribute<CsvExportAttribute>()!.DisplayName
                })
                .ToList();

            // Ghi header
            foreach (var prop in properties)
            {
                csvWriter.WriteField(prop.DisplayName);
            }
            await csvWriter.NextRecordAsync();

            // Ghi dữ liệu
            foreach (var item in data)
            {
                foreach (var prop in properties)
                {
                    var value = prop.Property.GetValue(item);
                    csvWriter.WriteField(value);
                }
                await csvWriter.NextRecordAsync();
            }

            await streamWriter.FlushAsync();
            var fileBytes = memoryStream.ToArray();

            return (fileBytes, fileName, "text/csv");
        }

        //   public async Task<(List<DuplicateError<T>> DuplicateErrors, List<T> ValidItems)>
        //FindDuplicatesWithErrorsAsync<T>(
        //    List<T> importList,
        //    Func<T, object> uniqueKeySelector
        //    //Func<List<T>, Task<List<T>>> dbQueryFunc,
        //    //Func<T, T, bool> isSameEntity,
        //    //bool skipDuplicate = false
        //       )
        //   {
        //       var duplicateErrors = new List<DuplicateError<T>>();
        //       var validItems = new List<T>(importList);

        //       // 🔹 1. Kiểm tra trùng trong file Excel
        //       var duplicateGroups = importList
        //           .Select((item, index) => new { Item = item, RowIndex = index + 1 })
        //           .GroupBy(x => uniqueKeySelector(x.Item))
        //           .Where(g => g.Count() > 1)
        //           .ToList();

        //       foreach (var group in duplicateGroups)
        //       {
        //           var rowIndexes = group.Select(g => g.RowIndex).ToList();
        //           duplicateErrors.Add(new DuplicateError<T>
        //           {
        //               RowIndexes = rowIndexes,
        //               DuplicateType = "Excel",
        //               DuplicateItems = group.Select(g => g.Item).ToList()
        //           });

        //           validItems.RemoveAll(item => rowIndexes.Contains(importList.IndexOf(item) + 1));
        //       }

        //// 🔹 2. Kiểm tra trùng trong database
        //var existingRecords = await dbQueryFunc(validItems);
        //foreach (var item in validItems.ToList())
        //{
        //    var matchedRecords = existingRecords.Where(dbItem => isSameEntity(item, dbItem)).ToList();
        //    if (matchedRecords.Any())
        //    {
        //        var rowIndex = importList.IndexOf(item) + 1;
        //        duplicateErrors.Add(new DuplicateError<T>
        //        {
        //            RowIndexes = new List<int> { rowIndex },
        //            DuplicateType = "Database",
        //            DuplicateItems = matchedRecords
        //        });

        //        if (skipDuplicate)
        //        {
        //            validItems.Remove(item);
        //        }
        //    }
        //}

        //    return (duplicateErrors, validItems);
        //}

        public async Task<(List<DuplicateError<T>> DuplicateErrors, List<T> ValidItems)>
FindDuplicatesInFileAsync<T>(List<T> importList)
        {
            var duplicateErrors = new List<DuplicateError<T>>();
            var validItems = new List<T>(importList);

            // 🔹 Kiểm tra trùng trong file Excel (so sánh tất cả các cột)
            var duplicateGroups = importList
                .Select((item, index) => new { Item = item, RowIndex = index }) // Không +1
                .GroupBy(x => JsonConvert.SerializeObject(x.Item)) // Serialize để so sánh toàn bộ object
                .Where(g => g.Count() > 1)
                .ToList();

            foreach (var group in duplicateGroups)
            {
                var rowIndexes = group.Select(g => g.RowIndex).ToList();
                duplicateErrors.Add(new DuplicateError<T>
                {
                    RowIndexes = rowIndexes,
                    DuplicateType = "Excel",
                    DuplicateItems = group.Select(g => g.Item).ToList()
                });

                validItems.RemoveAll(item => rowIndexes.Contains(importList.IndexOf(item)));
            }

            return (duplicateErrors, validItems);
        }

    }
}
