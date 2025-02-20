//using CapstoneProject_SP25_IPAS_API.Payload;
//using CapstoneProject_SP25_IPAS_Common.Utils;
//using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail;
//using CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel;
//using CapstoneProject_SP25_IPAS_Service.IService;
//using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;

//namespace CapstoneProject_SP25_IPAS_API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class MasterTypeDetailController : ControllerBase
//    {
//        private readonly IMasterTypeDetailService _masterTypeDetailService;

//        public MasterTypeDetailController(IMasterTypeDetailService masterTypeDetailService)
//        {
//            _masterTypeDetailService = masterTypeDetailService;
//        }

//        [HttpGet(APIRoutes.MasterTypeDetail.getMasterTypeDetailWithPagination, Name = "getAllMasterTypeDetail")]
//        public async Task<IActionResult> GetAllMasterTypeDetail(PaginationParameter paginationParameter, MasterTypeDetailFilter masterTypeDetailFilter)
//        {
//            try
//            {
//                var result = await _masterTypeDetailService.GetAllMasterTypeDetailPagination(paginationParameter, masterTypeDetailFilter);
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {

//                var response = new BaseResponse()
//                {
//                    StatusCode = StatusCodes.Status400BadRequest,
//                    Message = ex.Message
//                };
//                return BadRequest(response);
//            }
//        }
//        [HttpGet(APIRoutes.MasterTypeDetail.getMasterTypeDetailById, Name = "getMasterTypeDetailById")]
//        public async Task<IActionResult> GetMasterTypeDetailById([FromRoute] int id)
//        {
//            try
//            {
//                var result = await _masterTypeDetailService.GetMasterTypeDetailByID(id);
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                var response = new BaseResponse()
//                {
//                    StatusCode = StatusCodes.Status400BadRequest,
//                    Message = ex.Message
//                };
//                return BadRequest(response);
//            }
//        }

//        [HttpGet(APIRoutes.MasterTypeDetail.getMasterTypeDetailByName, Name = "getMasterTypeDetailByName")]
//        public async Task<IActionResult> GetMasterTypeDetailByName([FromRoute] string name)
//        {
//            try
//            {
//                var result = await _masterTypeDetailService.GetMasterTypeDetailByName(name);
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                var response = new BaseResponse()
//                {
//                    StatusCode = StatusCodes.Status400BadRequest,
//                    Message = ex.Message
//                };
//                return BadRequest(response);
//            }
//        }

//        [HttpPost(APIRoutes.MasterTypeDetail.createMasterTypeDetail, Name = "createMasterTypeDetail")]
//        public async Task<IActionResult> CreateMasterTypeDetail([FromBody] CreateMasterTypeDetailModel createMasterTypeDetailModel)
//        {
//            try
//            {
//                var result = await _masterTypeDetailService.CreateMasterTypeDetail(createMasterTypeDetailModel);
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                var response = new BaseResponse()
//                {
//                    StatusCode = StatusCodes.Status400BadRequest,
//                    Message = ex.Message
//                };
//                return BadRequest(response);
//            }
//        }

//        [HttpPut(APIRoutes.MasterTypeDetail.updateMasterTypeDetailInfo, Name = "updateMasterTypeDetail")]
//        public async Task<IActionResult> UpdateMasterTypeDetail([FromBody] UpdateMasterTypeDetailModel updateMasterTypeDetailModel)
//        {
//            try
//            {
//                var result = await _masterTypeDetailService.UpdateMasterTypeDetailInfo(updateMasterTypeDetailModel);
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                var response = new BaseResponse()
//                {
//                    StatusCode = StatusCodes.Status400BadRequest,
//                    Message = ex.Message
//                };
//                return BadRequest(response);
//            }
//        }

//        [HttpDelete(APIRoutes.MasterTypeDetail.permanenlyDelete, Name = "deleteMasterTypeDetail")]
//        public async Task<IActionResult> DeleteMasterTypeDetail([FromRoute] int id)
//        {
//            try
//            {
//                var result = await _masterTypeDetailService.PermanentlyDeleteMasterTypeDetail(id);
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                var response = new BaseResponse()
//                {
//                    StatusCode = StatusCodes.Status400BadRequest,
//                    Message = ex.Message
//                };
//                return BadRequest(response);
//            }
//        }

//    }
//}
