using AutoMapper;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReportService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BusinessResult> CropCareReport(int landPlotId, int year)
        {
            try
            {
                var totalTrees = _unitOfWork.PlanRepository.GetTotalTrees(landPlotId, year);
                var workLogs = await _unitOfWork.PlanRepository.GetWorkLogs(landPlotId, year);
                var totalTasks = workLogs.Count;
                var completedTasks = workLogs.Count(w => w.Status.ToLower() == "completed");

                var tasksByMonth = workLogs
                    .GroupBy(w => w.Date.Value.Month)
                    .Select(g => new TasksByMonthModel
                    {
                        Month = new DateTime(year, g.Key, 1).ToString("MMM"),
                        Completed = g.Count(w => w.Status.ToLower() == "completed"),
                        Remained = g.Count(w => w.Status.ToLower() != "completed")
                    }).ToList();

                var treeHealthStatus = _unitOfWork.PlanRepository.GetTreeHealthStatus(landPlotId);
                var treeNotes = _unitOfWork.PlanRepository.GetTreeNotes(landPlotId);

                var result = new CropCareReportModel
                {
                    LandPlotId = landPlotId,
                    Year = year,
                    TotalTrees = totalTrees,
                    TotalTasks = totalTasks,
                    CompletedTasks = completedTasks,
                    TasksByMonth = tasksByMonth,
                    TreeHealthStatus = treeHealthStatus,
                    TreeNotes = treeNotes
                };
                if (result != null)
                {
                    return new BusinessResult(Const.SUCCESS_GET_CROP_CARE_REPORT_CODE, Const.SUCCESS_GET_CROP_CARE_REPORT_MSG, result);
                }
                return new BusinessResult(Const.FAIL_GET_CROP_CARE_REPORT_CODE, Const.FAIL_GET_CROP_CARE_REPORT_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> Dashboard()
        {
            try
            {
                return new BusinessResult();
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public Task<BusinessResult> Dashboard(int year, int farmId, int month)
        {
            throw new NotImplementedException();
        }
    }
}
