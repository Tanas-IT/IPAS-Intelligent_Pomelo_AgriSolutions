using MailKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace CapstoneProject_SP25_IPAS_Common
{
    public static class Const
    {

        public static string APIIpasEndPoint = "https://localhost:7111";
        public static string APIEndPoint = "https://localhost:7111";
        #region Error Codes

        public static int ERROR_EXCEPTION = 500;
        public static string FAIL_TO_SAVE_TO_DATABASE = "Save to database fail";
        #endregion

        #region SUCCESS

        #region UserService
        public static int SUCCESS_LOGIN_CODE = 200;
        public static string SUCCESS_LOGIN_MSG = "Login Successfully";
        public static int SUCCESS_LOGOUT_CODE = 200;
        public static string SUCCESS_LOGOUT_MSG = "Log out success";
        public static int SUCCESS_RFT_CODE = 200;
        public static string SUCCESS_RFT_MSG = "Refresh Token successfully";
        public static int SUCCESS_REGISTER_CODE = 200;
        public static string SUCCESS_REGISTER_MSG = "You have successfully registered! Welcome aboard";
        public static int SUCCESS_SOFT_DELETE_USER_CODE = 200;
        public static string SUCCESS_SOFT_DELETE_USER_MSG = "Soft Delete User Success";
        public static int SUCCESS_BANNED_USER_CODE = 200;
        public static string SUCCESS_BANNED_USER_MSG = "Banned User Success";
        public static string SUCCESS_UNBANNED_USER_MSG = "Active User Success";
        public static int SUCCESS_SEND_OTP_RESET_PASSWORD_CODE = 200;
        public static string SUCCESS_SEND_OTP_RESET_PASSWORD_USER_MSG = "Otp has sended. Please check your mail";
        public static int SUCCESS_GET_USER_CODE = 200;
        public static string SUCCESS_GET_USER_BY_EMAIL_MSG = "Get user by email success";
        public static string SUCCESS_GET_USER_BY_ID_MSG = "Get user by id success";
        public static int SUCCESS_RESET_PASSWORD_CODE = 200;
        public static string SUCCESS_RESET_PASSWORD_MSG = "Reset password success";
        public static int SUCCESS_CONFIRM_RESET_PASSWORD_CODE = 200;
        public static string SUCCESS_CONFIRM_RESET_PASSWORD_MESSAGE = "You can reset password now";
        public static int SUCCESS_OTP_VALID_CODE = 200;
        public static string SUCCESS_OTP_VALID_MESSAGE = "Otp is valid";
        public static int SUCCESS_VALIDATE_TOKEN_GOOGLE_CODE = 200;
        public static string SUCCESS_TOKEN_GOOGLE_VALIDATE_MSG = "Validate google token success";
        public static int SUCCESS_FECTH_GOOGLE_USER_INFO_CODE = 200;
        public static string SUCCESS_FECTH_GOOGLE_USER_INFO_MSG = "Fecth info of user from google success";
        public static int SUCCESS_UPLOAD_IMAGE_CODE = 200;
        public static string SUCCESS_UPLOAD_IMAGE_MESSAGE = "Upload image success";
        public static int SUCCESS_UPLOAD_RESOURCE_CODE = 200;
        public static string SUCCESS_UPLOAD_RESOURCE_MESSAGE = "Upload resource success";
        public static int SUCCESS_UPLOAD_VIDEO_CODE = 200;
        public static string SUCCESS_UPLOAD_VIDEO_MESSAGE = "Upload video success";
        public static int SUCCESS_DELETE_IMAGE_CODE = 200;
        public static string SUCCESS_DELETE_IMAGE_MESSAGE = "Delete image success";
        public static int SUCCESS_DELETE_RESOURCE_CODE = 200;
        public static string SUCCESS_DELETE_RESOURCE_MESSAGE = "Delete resource success";
        public static int SUCCESS_DELETE_VIDEO_CODE = 200;
        public static string SUCCESS_DELETE_VIDEO_MESSAGE = "Delete video success";
        public static int SUCCESS_DELETE_USER_CODE = 200;
        public static string SUCCESS_DELETE_USER_MESSAGE = "Delete user success";
        public static int SUCCESS_GET_ALL_USER_CODE = 200;
        public static string SUCCESS_GET_ALL_USER_MESSAGE = "Get all user success";
        public static int SUCCESS_GET_ALL_USER_BY_ROLE_CODE = 200;
        public static string SUCCESS_GET_ALL_USER_BY_ROLE_MESSAGE = "Get all user by role success";
        public static int SUCCESS_UPDATE_USER_CODE = 200;
        public static string SUCCESS_UPDATE_MESSAGE = "Update user success";
        public static int SUCCESS_UPDATE_TOKEN_CODE = 200;
        public static string SUCCESS_UPDATE_TOKEN_MESSAGE = "Update token success";
        #endregion

        #region PlantLotService code
        public static int SUCCESS_GET_PLANT_LOT_BY_ID_CODE = 200;
        public static string SUCCESS_GET_PLANT_LOT_BY_ID_MESSAGE = "Get plant lot by id success";
        public static int SUCCESS_CREATE_PLANT_LOT_CODE = 200;
        public static string SUCCESS_CREATE_PLANT_LOT_MESSAGE = "Create plant lot success";
        public static int SUCCESS_UPDATE_PLANT_LOT_CODE = 200;
        public static string SUCCESS_UPDATE_PLANT_LOT_MESSAGE = "Update plant lot success";
        public static int SUCCESS_DELETE_PLANT_LOT_CODE = 200;
        public static string SUCCESS_DELETE_PLANT_LOT_MESSAGE = "Delete plant lot success";
        public static int SUCCESS_GET_ALL_PLANT_LOT_CODE = 200;
        public static string SUCCESS_GET_ALL_PLANT_LOT_MESSAGE = "Get all plant lot success";
        public static int SUCCESS_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE = 200;
        public static string SUCCESS_CREATE_MANY_PLANT_FROM_PLANT_LOT_MESSAGE = "Create many plant from plant lot success";
        #endregion

        #region FarmService code
        public static int SUCCESS_GET_FARM_CODE = 200;
        public static string SUCCESS_FARM_GET_MSG = "Get farm by id success";
        public static int SUCCESS_GET_ALL_FARM_WITH_PAGIN_CODE = 200;
        public static string SUCCESS_GET_ALL_FARM_WITH_PAGIN_EMPTY_CODE = "Get all farm empty";
        public static int SUCCESS_GET_FARM_ALL_PAGINATION_CODE = 200;
        public static string SUCCESS_GET_FARM_ALL_PAGINATION_FARM_MSG = "Get all pagination farm success";
        public static int SUCCESS_CREATE_FARM_CODE = 201;
        public static string SUCCESS_CREATE_FARM_MSG = "Create farm success";
        public static int SUCCESS_UPDATE_FARM_CODE = 200;
        public static string SUCCESS_UPDATE_FARM_MSG = "Update farm success";
        public static int SUCCESS_UPDATE_FARM_COORDINATION_CODE = 200;
        public static string SUCCESS_UPDATE_FARM_COORDINATION_MSG = "Update farm coordination success";
        public static int SUCCESS_DELETE_PERMANENTLY_FARM_CODE = 200;
        public static string SUCCESS_DELETE_PERMANENTLY_FARM_MSG = "Delete farm softed success";
        public static int SUCCESS_DELETE_SOFTED_FARM_CODE = 200;
        public static string SUCCESS_DELETE_SOFTED_FARM_MSG = "Delete farm softed success";
        public static int SUCCESS_GET_ALL_FARM_OF_USER_CODE = 200;
        public static string SUCCESS_GET_ALL_FARM_OF_USER_EMPTY_MSG = "No farm was found";
        public static string SUCCESS_GET_ALL_FARM_OF_USER_FOUND_MSG = "Get all farm of user success.";
        public static int SUCCESS_UPDATE_FARM_LOGO_CODE = 200;
        public static string SUCCESS_UPDATE_FARM_LOGO_MSG = "Update farm success";
        #endregion

        #region MasterType code
        public static int SUCCESS_GET_MASTER_TYPE_BY_ID_CODE = 200;
        public static string SUCCESS_GET_MASTER_TYPE_BY_ID_MESSAGE = "Get master type by id success";
        public static int SUCCESS_GET_MASTER_TYPE_BY_NAME_CODE = 200;
        public static string SUCCESS_GET_MASTER_TYPE_BY_NAME_MESSAGE = "Get master type by name success";
        public static int SUCCESS_CREATE_MASTER_TYPE_CODE = 200;
        public static string SUCCESS_CREATE_MASTER_TYPE_MESSAGE = "Create master type success";
        public static int SUCCESS_UPDATE_MASTER_TYPE_CODE = 200;
        public static string SUCCESS_UPDATE_MASTER_TYPE_MESSAGE = "Update master type success";
        public static int SUCCESS_DELETE_MASTER_TYPE_CODE = 200;
        public static string SUCCESS_DELETE_MASTER_TYPE_MESSAGE = "Delete master type success";
        public static int SUCCESS_GET_ALL_MASTER_TYPE_CODE = 200;
        public static string SUCCESS_GET_ALL_MASTER_TYPE_MESSAGE = "Get all master type success";
        #endregion

        #region MasterTypeDetail code
        public static int SUCCESS_GET_MASTER_TYPE_DETAIL_BY_ID_CODE = 200;
        public static string SUCCESS_GET_MASTER_TYPE_DETAIL_BY_ID_MESSAGE = "Get master type detail by id success";
        public static int SUCCESS_GET_MASTER_TYPE_DETAIL_BY_NAME_CODE = 200;
        public static string SUCCESS_GET_MASTER_TYPE_DETAIL_BY_NAME_MESSAGE = "Get master type detail by name success";
        public static int SUCCESS_CREATE_MASTER_TYPE_DETAIL_CODE = 200;
        public static string SUCCESS_CREATE_MASTER_TYPE_DETAIL_MESSAGE = "Create master type detail success";
        public static int SUCCESS_UPDATE_MASTER_TYPE_DETAIL_CODE = 200;
        public static string SUCCESS_UPDATE_MASTER_TYPE_DETAIL_MESSAGE = "Update master type detail success";
        public static int SUCCESS_DELETE_MASTER_TYPE_DETAIL_CODE = 200;
        public static string SUCCESS_DELETE_MASTER_TYPE_DETAIL_MESSAGE = "Delete master type detail success";
        public static int SUCCESS_GET_ALL_MASTER_TYPE_DETAIL_CODE = 200;
        public static string SUCCESS_GET_ALL_MASTER_TYPE_DETAIL_MESSAGE = "Get all master type detail success";
        #endregion

        #region Criteria
        public static int SUCCESS_UPDATE_CRITERIA_CODE = 200;
        public static string SUCCESS_UPDATE_CRITERIA_MSG = "Update criteria success";
        public static int SUCCESS_DELETE_CRITERIA_CODE = 200;
        public static string SUCCESS_DELETE_CRITERIA_MSG = "Delete criteria success";
        public static int SUCCESS_GET_CRITERIA_BY_ID_CODE = 200;
        public static string SUCCESS_GET_CRITERIA_BY_ID_MSG = "Get criteria by id success";
        #endregion

        #region Plant-Criteria
        public static int SUCCESS_APPLY_LIST_CRITERIA_PLANTS_CODE = 200;
        public static string SUCCESS_APPLY_LIST_CRITERIA_PLANTS_MSG = "Apply criteias for selected plants success";
        public static int SUCCES_CHECK_PLANT_CRITERIA_CODE = 200;
        public static string SUCCES_CHECK_PLANT_CRITERIA_MSG = "Check criteria of plant success";
        public static int SUCCES_GET_PLANT_CRITERIA_CODE = 200;
        public static string SUCCES_GET_PLANT_CRITERIA_MSG = "Get criteria of plant success";
        #endregion

        #region landplot
        public static int SUCCESS_GET_ALL_LANDPLOT_IN_FARM_CODE = 200;
        public static string SUCCESS_GET_ALL_LANDPLOT_IN_FARM_MSG = "Get all landplot of farm success";
        public static int SUCCESS_UPDATE_LANDPLOT_COORDINATION_CODE = 200;
        public static string SUCCESS_UPDATE_LANDPLOT_COORDINATION_MSG = "Update landplot coordination success";
        public static int SUCCESS_UPDATE_LANDPLOT_CODE = 200;
        public static string SUCCESS_UPDATE_LANDPLOT_MSG = "Update landplot success";
        public static int SUCCESS_CREATE_LANDPLOT_CODE = 201;
        public static string SUCCESS_CREATE_LANDPLOT_MSG = "Create landplot success";
        #endregion

        #region Partner code
        public static int SUCCESS_GET_PARTNER_BY_ID_CODE = 200;
        public static string SUCCESS_GET_PARTNER_BY_ID_MESSAGE = "Get partner by id success";
        public static int SUCCESS_GET_PARTNER_BY_ROLE_NAME_CODE = 200;
        public static string SUCCESS_GET_PARTNER_BY_ROLE_NAME_MESSAGE = "Get partner by role name success";
        public static int SUCCESS_CREATE_PARTNER_CODE = 200;
        public static string SUCCESS_CREATE_PARTNER_MESSAGE = "Create partner success";
        public static int SUCCESS_UPDATE_PARTNER_CODE = 200;
        public static string SUCCESS_UPDATE_PARTNER_MESSAGE = "Update partner success";
        public static int SUCCESS_DELETE_PARTNER_CODE = 200;
        public static string SUCCESS_DELETE_PARTNER_MESSAGE = "Delete partner success";
        public static int SUCCESS_GET_ALL_PARTNER_CODE = 200;
        public static string SUCCESS_GET_ALL_PARTNER_MESSAGE = "Get all partner success";
        #endregion

        #region GrowthStage code
        public static int SUCCESS_GET_GROWTHSTAGE_BY_ID_CODE = 200;
        public static string SUCCESS_GET_GROWTHSTAGE_BY_ID_MESSAGE = "Get GrowthStage by id success";
        public static int SUCCESS_CREATE_GROWTHSTAGE_CODE = 200;
        public static string SUCCESS_CREATE_GROWTHSTAGE_MESSAGE = "Create GrowthStage success";
        public static int SUCCESS_UPDATE_GROWTHSTAGE_CODE = 200;
        public static string SUCCESS_UPDATE_GROWTHSTAGE_MESSAGE = "Update GrowthStage success";
        public static int SUCCESS_DELETE_GROWTHSTAGE_CODE = 200;
        public static string SUCCESS_DELETE_GROWTHSTAGE_MESSAGE = "Delete GrowthStage success";
        public static int SUCCESS_GET_ALL_GROWTHSTAGE_CODE = 200;
        public static string SUCCESS_GET_ALL_GROWTHSTAGE_MESSAGE = "Get all GrowthStage success";
        #endregion

        #region ProcessStyle code
        public static int SUCCESS_GET_PROCESS_STYLE_BY_ID_CODE = 200;
        public static string SUCCESS_GET_PROCESS_STYLE_BY_ID_MESSAGE = "Get process style by id success";
        public static int SUCCESS_CREATE_PROCESS_STYLE_CODE = 200;
        public static string SUCCESS_CREATE_PROCESS_STYLE_MESSAGE = "Create process style success";
        public static int SUCCESS_UPDATE_PROCESS_STYLE_CODE = 200;
        public static string SUCCESS_UPDATE_PROCESS_STYLE_MESSAGE = "Update process style success";
        public static int SUCCESS_DELETE_PROCESS_STYLE_CODE = 200;
        public static string SUCCESS_DELETE_PROCESS_STYLE_MESSAGE = "Delete process style success";
        public static int SUCCESS_GET_ALL_PROCESS_STYLE_CODE = 200;
        public static string SUCCESS_GET_ALL_PROCESS_STYLE_MESSAGE = "Get all process style success";
        #endregion

        #region Process code
        public static int SUCCESS_GET_PROCESS_BY_ID_CODE = 200;
        public static string SUCCESS_GET_PROCESS_BY_ID_MESSAGE = "Get process by id success";
        public static int SUCCESS_GET_PROCESS_DATA_OF_PROCESS_CODE = 200;
        public static string SUCCESS_GET_PROCESS_DATA_OF_PROCESS_MESSAGE = "Get process data of process success";
        public static int SUCCESS_GET_PROCESS_BY_NAME_CODE = 200;
        public static string SUCCESS_GET_PROCESS_BY_NAME_MESSAGE = "Get process by name success";
        public static int SUCCESS_CREATE_PROCESS_CODE = 200;
        public static string SUCCESS_CREATE_PROCESS_MESSAGE = "Create process success";
        public static int SUCCESS_UPDATE_PROCESS_CODE = 200;
        public static string SUCCESS_UPDATE_PROCESS_MESSAGE = "Update process success";
        public static int SUCCESS_DELETE_PROCESS_CODE = 200;
        public static string SUCCESS_DELETE_PROCESS_MESSAGE = "Delete process success";
        public static int SUCCESS_GET_ALL_PROCESS_CODE = 200;
        public static string SUCCESS_GET_ALL_PROCESS_MESSAGE = "Get all process success";
        public static int SUCCESS_SOFT_DELETE_PROCESS_CODE = 200;
        public static string SUCCESS_SOFT_DELETE_PROCESS_MESSAGE = "Soft delete process success";
        #endregion

        #region SubProcess code
        public static int SUCCESS_GET_SUB_PROCESS_BY_ID_CODE = 200;
        public static string SUCCESS_GET_SUB_PROCESS_BY_ID_MESSAGE = "Get sub process by id success";
        public static int SUCCESS_GET_PROCESS_DATA_OF_SUB_PROCESS_CODE = 200;
        public static string SUCCESS_GET_PROCESS_DATA_OF_SUB_PROCESS_MESSAGE = "Get sub process data of sub process success";
        public static int SUCCESS_GET_SUB_PROCESS_BY_NAME_CODE = 200;
        public static string SUCCESS_GET_SUB_PROCESS_BY_NAME_MESSAGE = "Get sub process by name success";
        public static int SUCCESS_CREATE_SUB_PROCESS_CODE = 200;
        public static string SUCCESS_CREATE_SUB_PROCESS_MESSAGE = "Create sub process success";
        public static int SUCCESS_UPDATE_SUB_PROCESS_CODE = 200;
        public static string SUCCESS_UPDATE_SUB_PROCESS_MESSAGE = "Update sub process success";
        public static int SUCCESS_DELETE_SUB_PROCESS_CODE = 200;
        public static string SUCCESS_DELETE_SUB_PROCESS_MESSAGE = "Delete sub process success";
        public static int SUCCESS_GET_ALL_SUB_PROCESS_CODE = 200;
        public static string SUCCESS_GET_ALL_SUB_PROCESS_MESSAGE = "Get all sub process success";
        public static int SUCCESS_SOFT_DELETE_SUB_PROCESS_CODE = 200;
        public static string SUCCESS_SOFT_DELETE_SUB_PROCESS_MESSAGE = "Soft delete sub process success";
        #endregion

        #region Land Row
        public static int SUCCESS_CREATE_ONE_LANDROW_OF_FARM_CODE = 200;
        public static string SUCCESS_CREATE_ONE_LANDROW_OF_FARM_MSG = "Create one landrow success";
        public static int SUCCESS_DELETE_ONE_ROW_CODE = 200;
        public static string SUCCESS_DELETE_ONE_ROW_MSG = "Delete row success";
        public static int SUCCESS_UPDATE_ONE_ROW_CODE = 200;
        public static string SUCCESS_UPDATE_ONE_ROW_MSG = "Update row success";
        public static int SUCCESS_GET_ROW_BY_ID_CODE = 200;
        public static string SUCCESS_GET_ROW_BY_ID_MSG = "Get row by id success";
        public static int SUCCESS_GET_ROWS_SUCCESS_CODE = 200;
        public static string SUCCESS_GET_ROWS_SUCCESS_MSG = "Get rows success";
        public static string SUCCESS_GET_ROWS_EMPTY_MSG = "No resource was found";
        #endregion

        #region Plant
        public static int SUCCESS_GET_PLANT_IN_FARM_PAGINATION_CODE = 200;
        public static string SUCCESS_GET_PLANT_IN_FARM_PAGINATION_MSG = "Get plant in farm success.";
        public static int SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_CODE = 200;
        public static string SUCCESS_GET_PLANT_IN_PLOT_PAGINATION_MSG = "Get plant in land plot success.";
        public static int SUCCESS_GET_PLANT_BY_ID_PAGINATION_CODE = 200;
        public static string SUCCESS_GET_PLANT_BY_ID_PAGINATION_MSG = "Get plant success.";
        public static int SUCCESS_UPDATE_PLANT_CODE = 200;
        public static string SUCCESS_UPDATE_PLANT_MSG = "Update plant success";
        public static int SUCCESS_DELETE_PLANT_CODE = 200;
        public static string SUCCESS_DELETE_PLANT_MSG = "Delete plant success";
        public static int SUCCESS_DELETE_MULTIPLE_PLANT_CODE = 200;
        public static string SUCCESS_DELETE_MULTIPLE_PLANTS_MSG = "Delete multiple plant success";
        public static int SUCCESS_CREATE_PLANT_CODE = 200;
        public static string SUCCESS_CREATE_PLANT_MSG = "Create plant success";
        #endregion

        #region PlantGrowthHistory
        public static int SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_CODE = 200;
        public static string SUCCESS_GET_ALL_GROWTH_HISTORY_OF_PLANT_MSG = "Get all plant growth history success";
        public static int SUCCESS_GET_PLANT_HISTORY_BY_ID_CODE = 200;
        public static string SUCCESS_GET_PLANT_BY_ID_MSG = "Get plant growth history success";
        public static int SUCCESS_UPDATE_PLANT_GROWTH_CODE = 200;
        public static string SUCCESS_UPDATE_PLANT_GROWTH_MSG = "Update plant growth success";
        public static int SUCCESS_DELETE_PLANT_GROWTH_CODE = 200;
        public static string SUCCESS_DELETE_PLANT_GROWTH_MSG = "Delete plant growth success";
        public static int SUCCESS_DELETE_MULTIPLE_PLANT_GROWTH_CODE = 200;
        public static string SUCCESS_DELETE_MULTIPLE_PLANTS_GROWTH_MSG = "Delete multiple plant growth success";
        public static int SUCCESS_CREATE_PLANT_GROWTH_CODE = 200;
        public static string SUCCESS_CREATE_PLANT_GROWTH_MSG = "Create plant growth success";
        #endregion

        #region Plan
        public static int SUCCESS_GET_ALL_PLAN_CODE = 200;
        public static string SUCCESS_GET_ALL_PLAN_MSG = "Get all plan success";
        public static int SUCCESS_GET_PLAN_BY_ID_CODE = 200;
        public static string SUCCESS_GET_PLAN_BY_ID_MSG = "Get plan by id success";
        public static int SUCCESS_GET_PLAN_BY_NAME_CODE = 200;
        public static string SUCCESS_GET_PLAN_BY_NAME_MSG = "Get plan by name success";
        public static int SUCCESS_UPDATE_PLAN_CODE = 200;
        public static string SUCCESS_UPDATE_PLAN_MSG = "Update plan success";
        public static int SUCCESS_DELETE_PLAN_CODE = 200;
        public static string SUCCESS_DELETE_PLAN_MSG = "Delete plan success";
        public static int SUCCESS_SOFT_DELETE_PLAN_CODE = 200;
        public static string SUCCESS_SOFT_DELETE_PLAN_MSG = "Soft delete plan success";
        public static int SUCCESS_UN_SOFT_DELETE_PLAN_CODE = 200;
        public static string SUCCESS_UN_SOFT_DELETE_PLAN_MSG = "Un soft delete plan success";
        public static int SUCCESS_CREATE_PLAN_CODE = 200;
        public static string SUCCESS_CREATE_PLAN_MSG = "Create plan success";
        #endregion

        #region UserWorkLog
        public static int SUCCESS_GET_ALL_USER_WORK_LOG_CODE = 200;
        public static string SUCCESS_GET_ALL_USER_WORK_LOG_MSG = "Get all user work log success";
        public static int SUCCESS_GET_USER_WORK_LOG_BY_ID_CODE = 200;
        public static string SUCCESS_GET_USER_WORK_LOG_BY_ID_MSG = "Get user work log by id success";
        public static int SUCCESS_UPDATE_USER_WORK_LOG_CODE = 200;
        public static string SUCCESS_UPDATE_USER_WORK_LOG_MSG = "Update user work log success";
        public static int SUCCESS_DELETE_USER_WORK_LOG_CODE = 200;
        public static string SUCCESS_DELETE_USER_WORK_LOG_MSG = "Delete user work log success";
        public static int SUCCESS_CREATE_USER_WORK_LOG_CODE = 200;
        public static string SUCCESS_CREATE_USER_WORK_LOG_MSG = "Create user work log success";
        #endregion

        #region WorkLog
        public static int SUCCESS_GET_ALL_WORK_LOG_CODE = 200;
        public static string SUCCESS_GET_ALL_WORK_LOG_MSG = "Get all work log success";
        public static int SUCCESS_GET_WORK_LOG_BY_ID_CODE = 200;
        public static string SUCCESS_GET_WORK_LOG_BY_ID_MSG = "Get work log by id success";
        public static int SUCCESS_UPDATE_WORK_LOG_CODE = 200;
        public static string SUCCESS_UPDATE_WORK_LOG_MSG = "Update work log success";
        public static int SUCCESS_DELETE_WORK_LOG_CODE = 200;
        public static string SUCCESS_DELETE_WORK_LOG_MSG = "Delete work log success";
        public static int SUCCESS_CREATE_WORK_LOG_CODE = 200;
        public static string SUCCESS_CREATE_WORK_LOG_MSG = "Create work log success";
        public static int SUCCESS_ASSIGN_TASK_CODE = 200;
        public static string SUCCESS_ASSIGN_TASK_MSG = "Assign task success";
        public static int SUCCESS_ADD_NEW_TASK_CODE = 200;
        public static string SUCCESS_ADD_NEW_TASK_MSG = "Add new task success";
        #endregion

        #region Legal Document
        public static int SUCCESS_CREATE_LEGAL_DOCUMENT_CODE = 200;
        public static string SUCCESS_CREATE_LEGAL_DOCUMENT_MSG = "Create document success";
        public static int SUCCESS_UPDATE_LEGAL_DOCUMENT_CODE = 200;
        public static string SUCCESS_UPDATE_LEGAL_DOCUMENT_MSG = "Update document success";
        public static int SUCCESS_DELETE_LEGAL_DOCUMENT_CODE = 200;
        public static string SUCCESS_DELETE_LEGAL_DOCUMENT_MSG = "Delete document success";
        public static int SUCCESS_GET_LEGAL_DOCUMENT_BY_ID_CODE = 200;
        public static string SUCCESS_GET_LEGAL_DOCUMENT_BY_ID_MSG = "Get document success";
        public static int SUCCESS_GET_LEGAL_DOCUMENT_OF_FARM_CODE = 200;
        public static string SUCCESS_GET_LEGAL_DOCUMENT_OF_FARM_MSG = "Get document of farm success";
        #endregion

        #region Crop
        public static int SUCCESS_GET_CROP_CODE = 200;
        public static string SUCCESS_GET_CROP_BY_ID_MSG = "Get crop by id success";
        public static int SUCCESS_GET_ALL_CROP_WITH_PAGIN_CODE = 200;
        public static string SUCCESS_GET_ALL_CROP_WITH_PAGIN_EMPTY_CODE = "Get all crop empty";
        public static int SUCCESS_GET_CROP_ALL_PAGINATION_CODE = 200;
        public static string SUCCESS_GET_CROP_ALL_PAGINATION_FARM_MSG = "Get all pagination crop success";
        public static int SUCCESS_CREATE_CROP_CODE = 201;
        public static string SUCCESS_CREATE_CROP_MSG = "Create crop success";
        public static int SUCCESS_UPDATE_CROP_CODE = 200;
        public static string SUCCESS_UPDATE_CROP_MSG = "Update crop success";
        public static int SUCCESS_DELETE_PERMANENTLY_CROP_CODE = 200;
        public static string SUCCESS_DELETE_PERMANENTLY_CROP_MSG = "Delete crop softed success";
        public static int SUCCESS_DELETE_SOFTED_CROP_CODE = 200;
        public static string SUCCESS_DELETE_SOFTED_CROP_MSG = "Delete crop softed success";
        public static int SUCCESS_GET_ALL_CROP_CODE = 200;
        public static string SUCCESS_GET_ALL_CROP_EMPTY_MSG = "No crop was found";
        public static string SUCCESS_GET_ALL_CROP_FOUND_MSG = "Get all crop of landplot success.";
        #endregion

        #region Harvest
        public static int SUCCESS_GET_HARVEST_HISTORY_CODE = 200;
        public static string SUCCESS_GET_HARVEST_HISTORY_MSG = "Get harvest by id success";
        public static int SUCCESS_GET_ALL_HARVEST_HISTORY_WITH_PAGIN_CODE = 200;
        public static string SUCCESS_GET_ALL_HARVEST_HISTORY_WITH_PAGIN_EMPTY_CODE = "Get all harvest empty";
        public static int SUCCESS_GET_HARVEST_HISTORY_ALL_PAGINATION_CODE = 200;
        public static string SUCCESS_GET_HARVEST_TYPE_HISTORY_ALL_PAGINATION_HARVEST_HISTORY_MSG = "Get all pagination harvest success";
        public static int SUCCESS_CREATE_HARVEST_HISTORY_CODE = 201;
        public static string SUCCESS_CREATE_HARVEST_HISTORY_MSG = "Create harvest success";
        public static int SUCCESS_UPDATE_HARVEST_HISTORY_CODE = 200;
        public static string SUCCESS_UPDATE_HARVEST_HISTORY_MSG = "Update harvest success";
        public static int SUCCESS_DELETE_HARVEST_HISTORY_CODE = 200;
        public static string SUCCESS_DELETE_HARVEST_HISTORY_MSG = "Delete harvest success";
        public static int SUCCESS_GET_HARVEST_TYPE_HISTORY_ALL_PAGINATION_CODE = 200;
        public static string SUCCESS_GET_HARVEST_TYPE_HISTORY_ALL_PAGINATION_MSG = "Get all product need harvest success";
        #endregion

        #region Task Feedback
        public static int SUCCESS_GET_ALL_TASK_FEEDBACK_CODE = 200;
        public static string SUCCESS_GET_ALL_TASK_FEEDBACK_MSG = "Get all task feedback success";
        public static int SUCCESS_GET_TASK_FEEDBACK_BY_ID_CODE = 200;
        public static string SUCCESS_GET_TASK_FEEDBACK_BY_ID_MSG = "Get task feedback by id success";
        public static int SUCCESS_UPDATE_TASK_FEEDBACK_CODE = 200;
        public static string SUCCESS_UPDATE_TASK_FEEDBACK_MSG = "Update task feedback success";
        public static int SUCCESS_DELETE_TASK_FEEDBACK_CODE = 200;
        public static string SUCCESS_DELETE_TASK_FEEDBACK_MSG = "Delete task feedback success";
        public static int SUCCESS_CREATE_TASK_FEEDBACK_CODE = 200;
        public static string SUCCESS_CREATE_TASK_FEEDBACK_MSG = "Create task feedback success";
        public static int SUCCESS_GET_TASK_FEEDBACK_BY_MANAGER_ID_CODE = 200;
        public static string SUCCESS_GET_TASK_FEEDBACK_BY_MANAGER_ID_MSG = "Get task feedback by manager id success";
        public static int SUCCESS_GET_TASK_FEEDBACK_BY_WORK_LOG_ID_CODE = 200;
        public static string SUCCESS_GET_TASK_FEEDBACK_BY_WORK_LOG_ID_MSG = "Get task feedback by work log id success";
        #endregion

        #region Schedule
        public static int SUCCESS_GET_ALL_SCHEDULE_CODE = 200;
        public const string SUCCESS_GET_ALL_SCHEDULE_MSG = "Get all schedule success";
        #endregion

        #region Report
        public static int SUCCESS_GET_CROP_CARE_REPORT_CODE = 200;
        public static string SUCCESS_GET_CROP_CARE_REPORT_MSG = "Get dashboard report success";
        public static int SUCCESS_GET_DASHBOARD_REPORT_CODE = 200;
        public static string SUCCESS_GET_DASHBOARD_REPORT_MSG = "Get dashboard report success";
        public static int SUCCESS_GET_MATERIALS_IN_STORE_REPORT_CODE = 200;
        public static string SUCCESS_GET_MATERIALS_IN_STORE_REPORT_MSG = "Get materials in store report success"; 
        public static int SUCCESS_GET_PRODUCTIVITY_BY_PLOT_REPORT_CODE = 200;
        public static string SUCCESS_GET_PRODUCTIVITY_BY_PLOT_REPORT_MSG = "Get productivity by plot report success";
        #endregion

        #region Packages
        public static int SUCCESS_GET_PACKAGES_CODE = 400;
        public static string SUCCESS_GET_PACKAGES_MSG = "Get packages success";
        #endregion

        #endregion

        #region FAIL
        #region User fail code
        public static int FAIL_CREATE_CODE = -1;
        public static int FAIL_LOGOUT_CODE = 500;
        public static string FAIL_LOGOUT_MSG = "Have an error when logout";
        public static int FAIL_SOFT_DELETE_USER_CODE = 500;
        public static string FAIL_SOFT_DELETE_USER_MSG = "Have an error when soft delete user";
        public static int FAIL_BANNED_USER_CODE = 500;
        public static string FAIL_BANNED_USER_MSG = "Have an error when banned user";
        public static int FAIL_GET_USER_CODE = 500;
        public static string FAIL_GET_USER_BY_EMAIL_MSG = "Have an error when get user by email";
        public static string FAIL_GET_USER_BY_ID_MSG = "Have an error when get user by id";
        public static int FAIL_RESET_PASSWORD_CODE = 500;
        public static string FAIL_RESET_PASSWORD_MSG = "Have an error when reset password";
        public static int FAIL_CONFIRM_RESET_PASSWORD_CODE = 500;
        public static string FAIL_CONFIRM_RESET_PASSWORD_MESSAGE = "Otp does not correct or expired. Please try again or another";
        public static int FAIL_LOGIN_WITH_GOOGLE_CODE = 500;
        public static string FAIL_LOGIN_WITH_GOOGLE_MSG = "Your email has not exist in system";
        public static int FAIL_VALIDATE_GOOGLE_TOKEN_INVALID_CODE = 500;
        public static string FAIL_VALIDATE_GOOGLE_TOKEN_INVALID_MSG = "Your google code not valid. Please try again";
        public static int FAIL_USER_INFO_FETCH_CODE = 500;
        public static string FAIL_USER_INFO_FETCH_MSG = "Fetch info of user from google fail";
        public static int FAIL_UPLOAD_IMAGE_CODE = 500;
        public static string FAIL_UPLOAD_IMAGE_MESSAGE = "Upload image failed";
        public static int FAIL_UPLOAD_RESOURCE_CODE = 500;
        public static string FAIL_UPLOAD_RESOURCE_MESSAGE = "Upload resource failed";
        public static int FAIL_UPLOAD_VIDEO_CODE = 500;
        public static string FAIL_UPLOAD_VIDEO_MESSAGE = "Upload video failed";
        public static int FAIL_DELETE_IMAGE_CODE = 500;
        public static string FAIL_DELETE_IMAGE_MESSAGE = "Delete image failed";
        public static int FAIL_DELETE_RESOURCE_CODE = 500;
        public static string FAIL_DELETE_RESOURCE_MESSAGE = "Delete resource failed";
        public static int FAIL_DELETE_VIDEO_CODE = 500;
        public static string FAIL_DELETE_VIDEO_MESSAGE = "Delete video failed";
        public static int FAIL_DELETE_USER_CODE = 500;
        public static string FAIL_DELETE_USER_MESSAGE = "Delete user failed";
        public static int FAIL_GET_ALL_USER_BY_ROLE_CODE = 500;
        public static string FAIL_GET_ALL_USER_BY_ROLE_MESSAGE = "Get all user by role failed";
        public static int FAIL_GET_ALL_USER_CODE = 500;
        public static string FAIL_GET_ALL_USER_MESSAGE = "Get all user failed";
        public static int FAIL_UPDATE_USER_CODE = 500;
        public static string FAIL_UPDATE_USER_MESSAGE = "Update user failed";
        #endregion

        #region PlantLot Fail code
        public static int FAIL_CREATE_PLANT_LOT_CODE = 500;
        public static string FAIL_CREATE_PLANT_LOT_MESSAGE = "Create plant lot failed";
        public static int FAIL_UPDATE_PLANT_LOT_CODE = 500;
        public static string FAIL_UPDATE_PLANT_LOT_MESSAGE = "Update plant lot failed";
        public static int FAIL_DELETE_PLANT_LOT_CODE = 500;
        public static string FAIL_DELETE_PLANT_LOT_MESSAGE = "Delete plant lot failed";
        public static int FAIL_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE = 500;
        public static string FAIL_CREATE_MANY_PLANT_FROM_PLANT_LOT_MESSAGE = "Create many plant from plant lot failed";
        public static int FAIL_CREATE_MANY_PLANT_BECAUSE_CRITERIA_INVALID_CODE = 500;
        public static string FAIL_CREATE_MANY_PLANT_BECAUSE_CRITERIA_INVALID_MESSAGE = "Some criteria invalid";
        #endregion

        #region MasterType Fail code
        public static int FAIL_CREATE_MASTER_TYPE_CODE = 500;
        public static string FAIL_CREATE_MASTER_TYPE_MESSAGE = "Create master type failed";
        public static int FAIL_UPDATE_MASTER_TYPE_CODE = 500;
        public static string FAIL_UPDATE_MASTER_TYPE_MESSAGE = "Update master type failed";
        public static int FAIL_DELETE_MASTER_TYPE_CODE = 500;
        public static string FAIL_DELETE_MASTER_TYPE_MESSAGE = "Delete master type failed";
        public static int FAIL_GET_MASTER_TYPE_CODE = 500;
        public static string FAIL_GET_MASTER_TYPE_MESSAGE = "Get master type failed";
        #endregion

        #region MasterTypeDetail Fail code
        public static int FAIL_CREATE_MASTER_TYPE_DETAIL_CODE = 500;
        public static string FAIL_CREATE_MASTER_TYPE_DETAIL_MESSAGE = "Create master type detail failed";
        public static int FAIL_UPDATE_MASTER_TYPE_DETAIL_CODE = 500;
        public static string FAIL_UPDATE_MASTER_TYPE_DETAIL_MESSAGE = "Update master type detail failed";
        public static int FAIL_DELETE_MASTER_TYPE_DETAIL_CODE = 500;
        public static string FAIL_DELETE_MASTER_TYPE_DETAIL_MESSAGE = "Delete master type detail failed";
        public static int FAIL_GET_MASTER_TYPE_DETAIL_CODE = 500;
        public static string FAIL_GET_MASTER_TYPE_DETAIL_MESSAGE = "Get master type detail failed";
        #endregion

        #region ProcessStyle Fail code
        public static int FAIL_CREATE_PROCESS_STYLE_CODE = 500;
        public static string FAIL_CREATE_PROCESS_STYLE_MESSAGE = "Create process type failed";
        public static int FAIL_UPDATE_PROCESS_STYLE_CODE = 500;
        public static string FAIL_UPDATE_PROCESS_STYLE_MESSAGE = "Update process type failed";
        public static int FAIL_DELETE_PROCESS_STYLE_CODE = 500;
        public static string FAIL_DELETE_PROCESS_STYLE_MESSAGE = "Delete process type failed";
        public static int FAIL_GET_PROCESS_STYLE_CODE = 500;
        public static string FAIL_GET_PROCESS_STYLE_MESSAGE = "Get process type failed";
        #endregion

        #region Process Fail code
        public static int FAIL_CREATE_PROCESS_CODE = 500;
        public static string FAIL_CREATE_PROCESS_MESSAGE = "Create process failed";
        public static int FAIL_UPDATE_PROCESS_CODE = 500;
        public static string FAIL_UPDATE_PROCESS_MESSAGE = "Update process failed";
        public static int FAIL_DELETE_PROCESS_CODE = 500;
        public static string FAIL_DELETE_PROCESS_MESSAGE = "Delete process failed";
        public static int FAIL_SOFT_DELETE_PROCESS_CODE = 500;
        public static string FAIL_SOFT_DELETE_PROCESS_MESSAGE = "Soft delete process failed";
        public static int FAIL_GET_PROCESS_CODE = 500;
        public static string FAIL_GET_PROCESS_MESSAGE = "Get process failed";
        public static int FAIL_UPDATE_SUB_PROCESS_OF_PROCESS_CODE = 500;
        public static string FAIL_UPDATE_SUB_PROCESS_OF_PROCESS_MESSAGE = "Can not update subprocess that iss not part of the process";
        #endregion

        #region SubProcess Fail code
        public static int FAIL_CREATE_SUB_PROCESS_CODE = 500;
        public static string FAIL_CREATE_SUB_PROCESS_MESSAGE = "Create sub process failed";
        public static int FAIL_UPDATE_SUB_PROCESS_CODE = 500;
        public static string FAIL_UPDATE_SUB_PROCESS_MESSAGE = "Update sub process failed";
        public static int FAIL_DELETE_SUB_PROCESS_CODE = 500;
        public static string FAIL_DELETE_SUB_PROCESS_MESSAGE = "Delete sub process failed";
        public static int FAIL_SOFT_DELETE_SUB_PROCESS_CODE = 500;
        public static string FAIL_SOFT_DELETE_SUB_PROCESS_MESSAGE = "Soft delete sub process failed";
        public static int FAIL_GET_SUB_PROCESS_CODE = 500;
        public static string FAIL_GET_SUB_PROCESS_MESSAGE = "Get sub process failed";
        #endregion

        #region Criteria
        public static int FAIL_CREATE_CRITERIA_CODE = 500;
        public static string FAIL_CREATE_CRITERIA_MESSAGE = "Create criteria failed";
        public static int FAIL_GET_CRITERIA_BY_ID_CODE = 500;
        public static string FAIL_GET_CRITERIA_BY_ID_MSG = "Get criteria failed";
        public static int FAIL_UPDATE_CRITERIA_CODE = 500;
        public static string FAIL_UPDATE_CRITERIA_MSG = "Update criteria type failed";
        #endregion

        #region Plant-Criteria Fail code
        public static int FAIL_PLANTS_REQUEST_EMPTY_CODE = 500;
        public static string FAIL_PLANT_REQUEST_EMPTY_MSG = "You not select any plant";
        public static int FAIL_CRITERIA_REQUEST_EMPTY_CODE = 500;
        public static string FAIL_CRITERIA_REQUEST_EMPTY_MSG = "You not select any Criteria";
        public static int FAIL_APPLY_LIST_CRITERIA_PLANTS_CODE = 500;
        public static string FAIL_APPLY_LIST_CRITERIA_PLANTS_MSG = "Apply criteias for selected plants success";
        #endregion

        #region Farm Fail code
        public static int FAIL_CREATE_FARM_CODE = 500;
        public static string FAIL_CREATE_FARM_MSG = "Create farm have server error";
        public static int FAIL_UPDATE_FARM_CODE = 201;
        public static string FAIL_UPDATE_FARM_MSG = "Farm Update fail";
        public static int FAIL_UPDATE_FARM_COORDINATION_CODE = 201;
        public static string FAIL_UPDATE_FARM_COORDINATION_MSG = "Farm Update fail";
        public static int FAIL_DELETE_PERMANENTLY_FARM_CODE = 200;
        public static string FAIL_DELETE_PERMANENTLY_FARM_MSG = "Delete farm softed fail";
        public static int FAIL_DELETE_SOFTED_FARM_CODE = 200;
        public static string FAIL_DELETE_SOFTED_FARM_MSG = "Delete farm softed fail";
        public static int FAIL_UPDATE_FARM_LOGO_CODE = 201;
        public static string FAIL_UPDATE_FARM_LOGO_MSG = "Farm Update fail";
        public static int FAIL_DELETE_FARM_LANDPLOT_CODE = 500;
        public static string FAIL_DELETE_FARM_LANDPLOT_MSG = "Delete landplot of farm have server error";
        #endregion

        #region Partner Fail code
        public static int FAIL_CREATE_PARTNER_CODE = 500;
        public static string FAIL_CREATE_PARTNER_MESSAGE = "Create partner failed";
        public static int FAIL_UPDATE_PARTNER_CODE = 500;
        public static string FAIL_UPDATE_PARTNER_MESSAGE = "Update partner failed";
        public static int FAIL_DELETE_PARTNER_CODE = 500;
        public static string FAIL_DELETE_PARTNER_MESSAGE = "Delete partner failed";
        public static int FAIL_GET_PARTNER_CODE = 500;
        public static string FAIL_GET_PARTNER_MESSAGE = "Get partner failed";
        #endregion

        #region GrowthStage Fail code
        public static int FAIL_CREATE_GROWTHSTAGE_CODE = 500;
        public static string FAIL_CREATE_GROWTHSTAGE_MESSAGE = "Create GrowthStage failed";
        public static int FAIL_UPDATE_GROWTHSTAGE_CODE = 500;
        public static string FAIL_UPDATE_GROWTHSTAGE_MESSAGE = "Update GrowthStage failed";
        public static int FAIL_DELETE_GROWTHSTAGE_CODE = 500;
        public static string FAIL_DELETE_GROWTHSTAGE_MESSAGE = "Delete GrowthStage failed";
        public static int FAIL_GET_GROWTHSTAGE_CODE = 500;
        public static string FAIL_GET_GROWTHSTAGE_MESSAGE = "Get GrowthStage failed";
        #endregion

        #region LandRow Fail code
        public static int FAIL_CREATE_ONE_LANDROW_OF_FARM_CODE = 400;
        public static string FAIL_CREATE_ONE_LANDROW_OF_FARM_MSG = "Create landrow fail, please try again";
        #endregion

        #region Plant Fail code
        public static int FAIL_CREATE_PLANT_CODE = 400;
        public static string FAIL_CREATE_PLANT_MSG = "Create Plant fail";
        public static int FAIL_DELETE_PLANT_CODE = 400;
        public static string FAIL_DELETE_PLANT_MSG = "Delete plant fail";
        public static int FAIL_UPDATE_PLANT_CODE = 400;
        public static string FAIL_UPDATE_PLANT_MSG = "Update plant fail";
        #endregion

        #region plant growth history fail code
        public static int FAIL_CREATE_PLANT_GROWTH_HISTORY_CODE = 400;
        public static string FAIL_CREATE_PLANT_GROWTH_HISTORY_MSG = "Create Plant growth history fail";
        public static int FAIL_DELETE_PLANT_GROWTH_HISTORY_CODE = 400;
        public static string FAIL_DELETE_PLANT_GROWTH_HISTORY_MSG = "Delete plant growth history fail";
        public static int FAIL_UPDATE_PLANT_GROWTH_HISTORY_CODE = 400;
        public static string FAIL_UPDATE_PLANT_GROWTH_HISTORY_MSG = "Update plant growth history fail";
        #endregion

        #region Plan Fail code
        public static int FAIL_CREATE_PLAN_CODE = 500;
        public static string FAIL_CREATE_PLAN_MESSAGE = "Create plan failed";
        public static int FAIL_UPDATE_PLAN_CODE = 500;
        public static string FAIL_UPDATE_PLAN_MESSAGE = "Update plan failed";
        public static int FAIL_DELETE_PLAN_CODE = 500;
        public static string FAIL_DELETE_PLAN_MESSAGE = "Delete plan failed";
        public static int FAIL_SOFT_DELETE_PLAN_CODE = 500;
        public static string FAIL_SOFT_DELETE_PLAN_MESSAGE = "Soft delete plan failed";
        public static int FAIL_UN_SOFT_DELETE_PLAN_CODE = 500;
        public static string FAIL_UN_SOFT_DELETE_PLAN_MESSAGE = "Un soft delete plan failed";
        public static int FAIL_GET_PLAN_CODE = 500;
        public static string FAIL_GET_PLAN_MESSAGE = "Get plan failed";
        #endregion

        #region User Work Log Fail code
        public static int FAIL_CREATE_USER_WORK_LOG_CODE = 500;
        public static string FAIL_CREATE_USER_WORK_LOG_MESSAGE = "Create user work log failed";
        public static int FAIL_UPDATE_USER_WORK_LOG_CODE = 500;
        public static string FAIL_UPDATE_USER_WORK_LOG_MESSAGE = "Update user work log failed";
        public static int FAIL_DELETE_USER_WORK_LOG_CODE = 500;
        public static string FAIL_DELETE_USER_WORK_LOG_MESSAGE = "Delete user work log failed";
        public static int FAIL_GET_USER_WORK_LOG_CODE = 500;
        public static string FAIL_GET_USER_WORK_LOG_MESSAGE = "Get user work log failed";
        #endregion

        #region Work Log Fail code
        public static int FAIL_CREATE_WORK_LOG_CODE = 500;
        public static string FAIL_CREATE_WORK_LOG_MESSAGE = "Create work log failed";
        public static int FAIL_UPDATE_WORK_LOG_CODE = 500;
        public static string FAIL_UPDATE_WORK_LOG_MESSAGE = "Update work log failed";
        public static int FAIL_DELETE_WORK_LOG_CODE = 500;
        public static string FAIL_DELETE_WORK_LOG_MESSAGE = "Delete work log failed";
        public static int FAIL_GET_WORK_LOG_CODE = 500;
        public static string FAIL_GET_WORK_LOG_MESSAGE = "Get work log failed";
        public static int FAIL_ASSIGN_TASK_CODE = 500;
        public static string FAIL_ASSIGN_TASK_MESSAGE = "Assign task failed";
        public static int FAIL_ADD_NEW_TASK_CODE = 500;
        public static string FAIL_ADD_NEW_TASK_MESSAGE = "Add new task failed";
        #endregion

        #region Legal document fail code
        public static int FAIL_CREATE_LEGAL_DOCUMENT_CODE = 400;
        public static string FAIL_CREATE_LEGAL_DOCUMENT_MSG = "Create document Fail";
        public static int FAIL_UPDATE_LEGAL_DOCUMENT_CODE = 400;
        public static string FAIL_UPDATE_LEGAL_DOCUMENT_MSG = "Update document fail";
        public static int FAIL_DELETE_LEGAL_DOCUMENT_CODE = 400;
        public static string FAIL_DELETE_LEGAL_DOCUMENT_MSG = "Delete document fail";
        public static int FAIL_GET_LEGAL_DOCUMENT_BY_ID_CODE = 400;
        public static string FAIL_GET_LEGAL_DOCUMENT_BY_ID_MSG = "Get document fail";
        public static int FAIL_GET_LEGAL_DOCUMENT_OF_FARM_CODE = 400;
        public static string FAIL_GET_LEGAL_DOCUMENT_OF_FARM_MSG = "Get document of farm fail";
        #endregion

        #region Crop fail code
        public static int FAIL_CREATE_CROP_CODE = 400;
        public static string FAIL_CREATE_CROP_MSG = "Create crop Fail";
        public static int FAIL_UPDATE_CROP_CODE = 400;
        public static string FAIL_UPDATE_CROP_MSG = "Update crop fail";
        public static int FAIL_DELETE_CROP_CODE = 400;
        public static string FAIL_DELETE_CROP_MSG = "Delete crop fail";
        public static int FAIL_GET_CROP_BY_ID_CODE = 400;
        public static string FAIL_GET_CROP_BY_ID_MSG = "Get crop fail";
        public static int FAIL_GET_CROP_OF_FARM_CODE = 400;
        public static string FAIL_GET_CROP_OF_FARM_MSG = "Get crop of farm fail";
        #endregion

        #region Report fail code
        public static int FAIL_GET_CROP_CARE_REPORT_CODE = 500;
        public static string FAIL_GET_CROP_CARE_REPORT_MSG = "Get crop care report fail";
        public static int FAIL_GET_DASHBOARD_REPORT_CODE = 500;
        public static string FAIL_GET_DASHBOARD_REPORT_MSG = "Get dashboard report fail";
        public static int FAIL_GET_MATERIALS_IN_STORE_REPORT_REPORT_CODE = 500;
        public static string FAIL_GET_MATERIALS_IN_STORE_REPORT_MSG = "Get materials in store report fail";
        public static int FAIL_GET_PRODUCTIVITY_BY_PLOT_REPORT_CODE = 200;
        public static string FAIL_GET_PRODUCTIVITY_BY_PLOT_REPORT_MSG = "Get productivity by plot report fail";
        #endregion

        #region Task Feedback fail code
        public static int FAIL_GET_ALL_TASK_FEEDBACK_CODE = 500;
        public static string FAIL_GET_ALL_TASK_FEEDBACK_MSG = "Get all task feedback failed";
        public static int FAIL_GET_TASK_FEEDBACK_BY_ID_CODE = 500;
        public static string FAIL_GET_TASK_FEEDBACK_BY_ID_MSG = "Get task feedback by id failed";
        public static int FAIL_UPDATE_TASK_FEEDBACK_CODE = 500;
        public static string FAIL_UPDATE_TASK_FEEDBACK_MSG = "Update task feedback failed";
        public static int FAIL_DELETE_TASK_FEEDBACK_CODE = 500;
        public static string FAIL_DELETE_TASK_FEEDBACK_MSG = "Delete task feedback failed";
        public static int FAIL_CREATE_TASK_FEEDBACK_CODE = 500;
        public static string FAIL_CREATE_TASK_FEEDBACK_MSG = "Create task feedback failed";
        public static int FAIL_GET_TASK_FEEDBACK_BY_MANAGER_ID_CODE = 500;
        public static string FAIL_GET_TASK_FEEDBACK_BY_MANAGER_ID_MSG = "Get task feedback by manager id failed";
        public static int FAIL_GET_TASK_FEEDBACK_BY_WORK_LOG_ID_CODE = 200;
        public static string FAIL_GET_TASK_FEEDBACK_BY_WORK_LOG_ID_MSG = "Get task feedback by work log id failed";
        #endregion

        #region Schedule fail code
        public static int FAIL_GET_ALL_SCHEDULE_CODE = 500;
        public const string FAIL_GET_ALL_SCHEDULE_MSG = "Get all schedule failed";

        #region Harvest fail code
        public static int FAIL_CREATE_HARVEST_HISTORY_CODE = 400;
        public static string FAIL_CREATE_HARVEST_HISTORY_MSG = "Create harvest have server error";
        public static int FAIL_UPDATE_HARVEST_HISTORY_CODE = 400;
        public static string FAIL_UPDATE_HARVEST_HISTORY_MSG = "Harvest Update fail";
        public static int FAIL_UPDATE_HARVEST_HISTORY_COORDINATION_CODE = 400;
        public static string FAIL_UPDATE_HARVEST_HISTORY_COORDINATION_MSG = "Harvest update fail";
        public static int FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_CODE = 400;
        public static string FAIL_DELETE_PERMANENTLY_HARVEST_HISTORY_MSG = "Delete harvest permanent fail";
        public static int FAIL_DELETE_SOFTED_HARVEST_HISTORY_CODE = 400;
        public static string FAIL_DELETE_SOFTED_HARVEST_HISTORY_MSG = "Delete harvest softed fail";
        #endregion
        #endregion

        #endregion

        #region WARNING

        public static int WARNING_INVALID_LOGIN_CODE = 400;
        public static string WARNING_INVALID_LOGIN_MSG = "UserName or Password is wrong";
        public static int WARNING_INVALID_REFRESH_TOKEN_CODE = 400;
        public static string WARNING_INVALID_REFRESH_TOKEN_MSG = "Refresh Token is expired time. Please log out";
        public static int WARNING_VALUE_INVALID_CODE = 500;
        public static string WARNING_VALUE_INVALID_MSG = "Value invalid";
        #region UserService
        public static int WARNING_ACCOUNT_BANNED_CODE = 400;
        public static string WARNING_ACCOUNT_BANNED_MSG = "Your account has been banned. Contact support for further details";
        public static int WARNING_ACCOUNT_DELETED_CODE = 400;
        public static string WARNING_ACCOUNT_DELETED_MSG = "Your account has been deleted. Contact support for further details";
        public static int WARNING_PASSWORD_INCORRECT_CODE = 400;
        public static string WARNING__PASSWORD_INCORRECT_MSG = "Password is not correct";
        public static int WARNING_SIGN_IN_CODE = 400;
        public static string WARNING_SIGN_IN_MSG = "Account does not exist. Please try again!";
        public static int WARNING_RFT_NOT_EXIST_CODE = 400;
        public static string WARNING_RFT_NOT_EXIST_MSG = "Refresh token does not exist in system";
        public static int WARNING_ACCOUNT_IS_EXISTED_CODE = 400;
        public static string WARNING_ACCOUNT_IS_EXISTED_MSG = "Email is already registered";
        public static int WARNING_ROLE_IS_NOT_EXISTED_CODE = 400;
        public static string WARNING_ROLE_IS_NOT_EXISTED_MSG = "Role does not existed";
        public static int WARNING_BANNED_USER_CODE = 400;
        public static string WARNING_BANNED_USER_MSG = "User does not existed or is banned";
        public static int WARNING_RESET_PASSWORD_CODE = 400;
        public static string WARNING_RESET_PASSWORD_MSG = "Account does not exist or otp incorrect";
        public static int WARNING_CHECK_MAIL_REGISTER_CODE = 400;
        public static string WARNING_CHECK_MAIL_REGISER_MSG = "Email and OTP are required";
        public static int WARNING_USER_DOES_NOT_EXIST_CODE = 400;
        public static string WARNING_USER_DOES_NOT_EXIST_MSG = "User does not existed";
        public static int WARNING_GET_ALL_USER_DOES_NOT_EXIST_CODE = 400;
        public static string WARNING_GET_ALL_USER_DOES_NOT_EXIST_MSG = "Does not have any user";
        #endregion

        #region PlantLot
        public static int WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_CODE = 400;
        public static string WARNING_GET_PLANT_LOT_BY_ID_DOES_NOT_EXIST_MSG = "Does not have any plant lot";
        public static int WARNING_CREATE_MANY_PLANT_FROM_PLANT_LOT_CODE = 400;
        public static string WARNING_CREATE_MANY_PLANT_FROM_PLANT_LOT_MSG = "Some criteria does not pass. Please check all criteria again";
        public static int WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE = 400;
        public static string WARNING_ROW_LENGHT_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG = "Lenght of the row larger than leght of landplot";
        public static int WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_CODE = 400;
        public static string WARNING_ROW_WIDTH_IN_LANDPLOT_LARGER_THAN_LANDPLOT_MSG = "Width of the row larger than width of landplot";
        public static int WARNING_INVALID_PLOT_COORDINATIONS_CODE = 400;
        public static string WARNING_INVALID_PLOT_COORDINATIONS_MSG = "Plot need at least 3 point to create";
        #endregion

        #region MasterType
        public static int WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_CODE = 200;
        public static string WARNING_GET_MASTER_TYPE_DOES_NOT_EXIST_MSG = "Does not have any master type";
        #endregion

        #region MasterTypeDetail
        public static int WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_MASTER_TYPE_DETAIL_DOES_NOT_EXIST_MSG = "Does not have any master type detail";
        #endregion

        #region FarmService
        public static int WARNING_GET_FARM_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_FARM_NOT_EXIST_MSG = "Farm Resource not found";
        public static int WARNING_GET_ALL_FARM_DOES_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_ALL_FARM_DOES_NOT_EXIST_MSG = "Does not have any farm";
        public static int WARNING_GET_LANDPLOT_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_LANDPLOT_NOT_EXIST_MSG = "Land plot does not exist in this farm.";
        public static string WARNING_GET_ALL_LANDPLOT_NOT_EXIST_MSG = "Land plot does not exist in this farm.";

        #endregion

        #region CriteriaType
        public static int WARNING_GET_PARTNER_DOES_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_PARTNER_DOES_NOT_EXIST_MSG = "Does not have any partner";
        #endregion

        #region GrowthStage
        public static int WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_GROWTHSTAGE_DOES_NOT_EXIST_MSG = "Does not have any GrowthStage";
        #endregion

        #region ProcessStyle
        public static int WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_PROCESS_TYPE_DOES_NOT_EXIST_MSG = "Does not have any prcoess type";
        #endregion

        #region Process
        public static int WARNING_GET_PROCESS_DOES_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_PROCESS_DOES_NOT_EXIST_MSG = "Does not have any process";
        public static int WARNING_GET_PROCESS_DATA_OF_PROCESS_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_PROCESS_DATA_OF_PROCESS_NOT_EXIST_MSG = "Does not have any data of this process";
        public static int WARNING_MISSING_DATE_FILTER_CODE = 400;
        public const string WARNING_MISSING_DATE_FILTER_MSG = "Please enter both values for the date filter (Create Date From and Create Date To).";
        public static int WARNING_INVALID_DATE_FILTER_CODE = 400;
        public static string WARNING_INVALID_DATE_FILTER_MSG = "Date 'To' must greater than Date 'From'";
        #endregion

        #region SubProcess
        public static int WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_SUB_PROCESS_DOES_NOT_EXIST_MSG = "Does not have any sub process";
        public static int WARNING_GET_PROCESS_DATA_OF_SUB_PROCESS_NOT_EXIST_CODE = 404;
        public static string WARNING_GET_PROCESS_DATA_OF_SUB_PROCESS_NOT_EXIST_MSG = "Does not have any data of this sub process";
        #endregion

        #region LandRow
        public static int WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_CODE = 400;
        public static string WARNING_LENGHT_OR_WIDTH_OF_ROW_LARGER_THAN_PLOT_MSG = "Lenght or width of row larger than land plot";
        public static int WARNING_AREA_WAS_USED_LARGER_THAN_LANDPLOT_CODE = 400;
        public static string WARNING_AREA_WAS_USED_LARGER_THAN_LANDPLOT_MSG = "Total area was user larger than area of landplot";
        public static int WARNING_ROW_NOT_EXIST_CODE = 400;
        public static string WARNING_ROW_NOT_EXIST_MSG = "This row not exist";
        #endregion

        #region Plant
        public static int WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_CODE = 200;
        public static string WARNING_GET_ALL_PLANT_DOES_NOT_EXIST_MSG = "Get plant in farm empty.";
        public static int WARNING_GET_PLANT_NOT_EXIST_CODE = 400;
        public static string WARNING_GET_PLANT_NOT_EXIST_MSG = "Plant not exist.";
        public static int WARNING_GET_PLANTS_NOT_EXIST_CODE = 400;
        public static string WARNING_GET_PLANTS_NOT_EXIST_MSG = "No plant was found.";
        public static int WARNING_PLANT_IN_LANDROW_FULL_CODE = 400;
        public static string WARNING_PLANT_IN_LANDROW_FULL_MSG = "This row has full of plant";
        #endregion

        #region Plant Growth History
        public static int WARNING_PLANT_GROWTH_NOT_EXIST_CODE = 400;
        public static string WARNING_PLANT_GROWTH_NOT_EXIST_MSG = "Plant growth history not exist.";
        public static int WARNING_GET_PLANT_HISTORY_BY_ID_EMPTY_CODE = 200;
        public static string WARNING_GET_PLANT_HISTORY_BY_ID_EMPTY_MSG = "Get plant growth history empty.";
        #endregion

        #region Plan History
        public static int WARNING_GET_PLAN_DOES_NOT_EXIST_CODE = 400;
        public static string WARNING_GET_PLAN_DOES_NOT_EXIST_MSG = "Plan not exist.";
        public static int WARNING_GET_PLAN_EMPTY_CODE = 400;
        public static string WARNING_GET_PLAN_EMPTY_MSG = "No plan was found.";
        #endregion

        #region Plant Criteria
        public static int WARNING_GET_CRITERIA_OF_PLANT_EMPTY_CODE = 400;
        public static string WARNING_GET_CRITERIA_OF_PLANT_EMPTY_MSG = "Do not have any resource";
        #endregion

        #region User Work Log
        public static int SUCCESS_USER_NO_CONFLICT_SCHEDULE_CODE = 200;
        public static string SUCCESS_USER_NO_CONFLICT_SCHEDULE_MSG = "User does not conflict schedule";
        public static int WARNING_USER_CONFLICT_SCHEDULE_CODE = 400;
        public static string WARNING_USER_CONFLICT_SCHEDULE_MSG = "User conflict schedule. Please select another time";
        #endregion
        #region Work Log
        public static int SUCCESS_HAS_SCHEDULE_CODE = 200;
        public static string SUCCESS_HAS_SCHEDULE_MSG = "Get schedule success";
        public static int WARNING_NO_SCHEDULE_CODE = 400;
        public static string WARNING_NO_SCHEDULE_MSG = "Do not have any worklog to display on schedule";
        #endregion
        #region Legal Document 
        public static int WARNING_LEGAL_DOCUMENT_NOT_EXIST_CODE = 400;
        public static string WARNING_LEGAL_DOCUMENT_NOT_EXIST_MSG = "This document not exist";
        public static int WARNING_GET_DOCUMENT_EMPTY_CODE = 200;
        public static string WARNING_GET_DOCUMENT_EMPTY_MSG = "Get document empty.";
        #endregion

        #region Crop
        public static int WARNING_CROP_NOT_EXIST_CODE = 400;
        public static string WARNING_CROP_NOT_EXIST_MSG = "Crop not exist";
        public static int WARNING_CROP_OF_LANDPLOT_EMPTY_CODE = 200;
        public static string WARNING_CROP_OF_LANDPLOT_EMPTY_MSG = "This landplot not have crop.";
        public static int WARNING_CROP_OF_FARM_EMPTY_CODE = 200;
        public static string WARNING_CROP_OF_FARM_EMPTY_MSG = "This farm not have crop.";
        public static int WARNING_CREATE_CROP_INVALID_YEAR_VALUE_CODE = 400;
        public static string WARNING_CREATE_CROP_INVALID_YEAR_VALUE_MSG = "Year of the crop must from this year to later. Please try again";
        public static int WARNING_CREATE_CROP_MUST_HAVE_LANDPLOT_CODE = 400;
        public static string WARNING_CREATE_CROP_MUST_HAVE_LANDPLOT_MSG = "Create crop must choose a landplot. Please try again";
        public static int WARNING_CROP_EXPIRED_CODE = 400;
        public static string WARNING_CROP_EXPIRED_MSG = "This crop is expired to harvest, please choose again.";
        #endregion

        #region Report
        public static int WARNING_GET_CROP_CARE_REPORT_CODE = 400;
        public static string WARNING_GET_CROP_CARE_REPORT_MSG = "Do not have any data to get crop care report";
        public static int WARNING_GET_DASHBOARD_REPORT_CODE = 400;
        public static string WARNING_GET_DASHBOARD_REPORT_MSG = "Do not have any data to get dashboard report";
        public static int WARNING_GET_MATERIALS_IN_STORE_REPORT_CODE = 400;
        public static string WARNING_GET_MATERIALS_IN_STORE_REPORT_MSG = "Do not have any data to get materials in store report";
        public static int WARNING_GET_PRODUCTIVITY_BY_PLOT_REPORT_CODE = 200;
        public static string WARNING_GET_PRODUCTIVITY_BY_PLOT_REPORT_MSG = "Do not have any data to get productivity by plot in store report";
        #endregion
        #region Task Feedback
        public static int WARNING_TASK_FEEDBACK_NOT_EXIST_CODE = 400;
        public static string WARNING_TASK_FEEDBACK_NOT_EXIST_MSG = "Task Feedback does not exist";
        #endregion
        #region Schedule
        public const string WARNING_MISSING_SCHEDULE_DATE_FILTER_MSG = "Please enter both values for the date filter (From Date and To Date).";
        public static int WARNING_MISSING_TIME_FILTER_CODE = 400;
        public const string WARNING_MISSING_TIME_FILTER_MSG = "Please enter both values for the time filter (from time and to time).";
        public static int WARNING_INVALID_TIME_FILTER_CODE = 400;
        public static string WARNING_INVALID_TIME_FILTER_MSG = "From time must greater than To time";
        public static int WARNING_DO_NOT_HAVE_ANY_SCHEDULE_CODE = 400;
        public static string WARNING_DO_NOT_HAVE_ANY_SCHEDULE_MSG = "Schedule does not exist";
        #endregion

        #region Harvest
        public static int WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_CODE = 400;
        public static string WARNING_HARVEST_PRODUCT_OF_FARM_MUST_CREATE_BEFORE_MSG = "Your farm have no product to harvest, please create product in category";
        public static int WARNING_HARVEST_MUST_IN_CROP_CODE = 400;
        public static string WARNING_HARVEST_MUST_IN_CROP_MSG = "You must choose crop. Please try again";
        public static int WARNING_HARVEST_DATE_IN_PAST_CODE = 400;
        public static string WARNING_HARVEST_DATE_IN_PAST_MSG = "Your harvest date in past. Please try again";
        public static int WARNING_HARVEST_TYPE_HISTORY_EMPTY_CODE = 400;
        public static string WARNING_HARVEST_TYPE_HISTORY_EMPTY_MSG = "This harvest is empty";
        public static int WARNING_HARVEST_NOT_EXIST_CODE = 400;
        public static string WARNING_HARVEST_NOT_EXIST_MSG = "This harvest is empty";
        public static int WARNING_GET_HARVEST_NOT_EXIST_CODE = 400;
        public static string WARNING_GET_HARVEST_NOT_EXIST_MSG = "Harvest not exist";
        public static int WARNING_HARVEST_TYPE_OF_PRODUCT_NOT_SUITABLE_CODE = 400;
        public static string WARNING_HARVEST_TYPE_OF_PRODUCT_NOT_SUITABLE_MSG = "your product type not suitable";
        #endregion

        #region Package
        public static int WARNING_GET_PACKAGES_EMPTY_CODE = 400;
        public static string WARNING_GET_PACKAGES_EMPTY_MSG = "No package were found";
        public static int WARNING_FARM_EXPIRED_CODE = 400;
        public static string WARNING_FARM_EXPIRED_MSG = "Your farm has no package in time";
        #endregion
        #endregion
    }
}