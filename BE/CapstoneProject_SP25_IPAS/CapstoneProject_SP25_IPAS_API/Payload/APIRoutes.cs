namespace CapstoneProject_SP25_IPAS_API.Payload
{
    public static class APIRoutes
    {
        public const string Base = "/ipas";

        public static class WebSocket
        {
            public const string ws = Base + "/websocket";
        }

        public static class Farm
        {
            public const string prefix = Base + "/farms";
            public const string createFarm = prefix + "";
            public const string getFarmById = prefix + "";
            public const string getAllFarmOfUser = prefix + "/get-farm-of-user";
            public const string getFarmWithPagination = prefix + "";
            public const string permanenlyDelete = prefix + "/delete-permanenly";
            public const string softedDeleteFarm = prefix + "/softed-delete-farm";
            public const string updateFarmInfo = prefix + "/update-farm-info";
            public const string updateFarmLogo = prefix + "/update-farm-logo";
            public const string updateFarmCoordination = prefix + "/update-farm-coordination";
            public const string getUserOfFarmByRole = prefix + "/get-users-farm-by-role";
            public const string getUsersOfFarmById = prefix + "/user-farm/get-by-id";
            public const string updateUserOfFarm = prefix + "/user-farm/";
            public const string addUserToFarm = prefix + "/user-farm/";
            public const string getUsersOfFarm = prefix + "/user-farm/";
            public const string deleteUserFarm = prefix + "/user-farm";
        }

        public static class LandPlot
        {
            public const string prefix = Base + "/landplots";
            public const string createLandPlot = prefix + "";
            public const string getAllLandPlotNoPagin = prefix + "";
            public const string getAllForSelected = prefix + "/get-for-selected";
            public const string updateLandPlotCoordination = prefix + "/update-coordination";
            public const string updateLandPlotInfo = prefix + "/update-info";
            public const string deleteLandPlotOfFarm = prefix + "";
            public const string getLandPlotById = prefix + "";

        }

        public static class User
        {
            public const string createUser = Base + "/users";
            public const string getUserById = Base + "/users/get-user-by-id/{userId}";
            public const string getUserByEmail = Base + "/users/get-user-by-email/{email}";
            public const string getAllUser = Base + "/users/get-all-user";
            public const string getAllUserByRole = Base + "/users/get-all-user-by-role/{roleName}";
            public const string bannedUser = Base + "/users/banned-user/{userId}";
            public const string getUserWithPagination = Base + "/users";
            public const string permanenlyDelete = Base + "/users/delete-permanenly/{userId}";
            public const string softedDeleteUser = Base + "/users/softed-delete-user/{userId}";
            public const string updateUserInfo = Base + "/users/update-user-info";
            public const string updateUserAvatar = Base + "/users/update-user-avatar/{userId}";
        }

        public static class PlantLot
        {
            public const string createPlantLot = Base + "/plantLots";
            public const string getPlantLotById = Base + "/plantLots/get-plantLot-by-id/{id}";
            public const string getPlantLotWithPagination = Base + "/plantLots";
            public const string permanenlyDelete = Base + "/plantLots/delete-permanenly/{id}";
            public const string updatePlantLotInfo = Base + "/plantLots/update-plantLot-info";
            public const string createManyPlantFromPlantLot = Base + "/plantLots/create-many-plant";
            public const string FillPlantToPlot = Base + "/fill-plant-to-plot";
        }

        public static class Resource
        {
            public const string uploadImage = Base + "/resource/upload-image";
            public const string uploadResource = Base + "/resource/upload";
            public const string uploadvideo = Base + "/resource/upload-video";
            public const string deleteImageByURL = Base + "/resource/delete-image-by-url";
            public const string deleteVideoByURL = Base + "/resource/delete-video-by-url";
            public const string deleteResourceByURL = Base + "/resource/delete";

        }

        public static class MasterType
        {
            public const string createMasterType = Base + "/masterTypes";
            public const string getMasterTypeById = Base + "/masterTypes/get-masterType-by-id/{id}";
            public const string getMasterTypeWithPagination = Base + "/masterTypes";
            public const string permanenlyDelete = Base + "/masterTypes/delete-permanently/{id}";
            public const string permanenlyDeletemanyMasterType = Base + "/masterTypes/delete-permanently-many-masterType";
            public const string updateMasterTypeInfo = Base + "/masterTypes/update-masterType-info";
            public const string getMasterTypeByName = Base + "/masterTypes/get-masterType-by-name";
            public const string softedDelete = Base + "/masterTypes/delete-softed";
        }

        public static class Criteria
        {
            public const string prefix = Base + "/criterias";
            public const string updateListCriteriaType = prefix + "/update-list-criteria";
            public const string getCriteriaById = prefix + "";
            public const string getCriteriaOfObject = prefix + "/get-criteria-of-object";
            public const string updateCriteriaInfo = prefix + "";
            public const string createMasTypeCriteria = prefix + "/create-master-type-criteria";

            public const string prefixCriteriaTarget = Base + "/criterias/target";
            public const string applyCriteriaTargetMultiple = prefixCriteriaTarget + "/apply-criteria";
            public const string updateCriteriaTarget = prefixCriteriaTarget  + "/update-criteria-target";
            public const string updateCriteriaMultipleTarget = prefixCriteriaTarget + "/update-multiple-target";
            public const string checkCriteriaForTarget = prefixCriteriaTarget + "/check-criteria-for-target";
            public const string deleteCriteriaMultipleTarger = prefixCriteriaTarget + "/delete-for-multiple-target";
        }

        public static class Authentication
        {
            public const string registerSendOtp = Base + "/register/send-otp";
            public const string registerVerifyOtp = Base + "/register/verify-otp";
            public const string Register = Base + "/register";
            public const string Login = Base + "/login";
            public const string loginWithGoogle = Base + "/login-with-google";
            public const string Logout = Base + "/logout";
            public const string refreshToken = Base + "/refresh-token";
            public const string forgetPassword = Base + "/forget-password";
            public const string forgetPasswordConfirm = Base + "/forget-password/confirm";
            public const string forgetPasswordNewPassword = Base + "/forget-password/new-password";
            public const string ValidateRoleUserInFarm = Base + "/validate-role-in-farm";
            public const string UpdateRoleInToken = Base + "/update-role-out-farm";
        }

        public static class Partner
        {
            public const string createPartner = Base + "/partners";
            public const string getPartnerById = Base + "/partners/get-partner-by-id/{id}";
            public const string getPartnerWithPagination = Base + "/partners";
            public const string permanenlyDelete = Base + "/partners/delete-permanenly/{id}";
            public const string updatePartnerInfo = Base + "/partners/update-partner-info";
            public const string getPartnerByRoleName = Base + "/partners/get-partner-by-role-name/{roleName}";
        }

        public static class GrowthStage
        {
            public const string createGrowthStage = Base + "/growthStages";
            public const string getGrowthStageById = Base + "/growthStages/get-growthStage-by-id/{id}";
            public const string getGrowthStageWithPagination = Base + "/growthStages";
            public const string permanenlyDelete = Base + "/growthStages/delete-permanenly/{id}";
            public const string updateGrowthStageInfo = Base + "/growthStages/update-growthStage-info";
            public const string getGrowthStageByFarm = Base + "/growthStages/get-for-select/{farm-id}";
            public const string softDeleteManyGrowthStage = Base + "/growthStages/softed-delete";
            public const string permentlyDeleteManyGrowthStage = Base + "/growthStages/delete-permanently-many-growthStage";
        }

        public static class ProcessStyle
        {
            public const string createProcessStyle = Base + "/processStyles";
            public const string getProcessStyleById = Base + "/processStyles/get-processStyle-by-id/{id}";
            public const string getProcessStyleWithPagination = Base + "/processStyles";
            public const string permanenlyDelete = Base + "/processStyles/delete-permanenly/{id}";
            public const string updateProcessStyleInfo = Base + "/processStyles/update-processStyle-info";
        }

        public static class Process
        {
            public const string createProcess = Base + "/processes";
            public const string createManyProcess = Base + "/processes/create-many";
            public const string getProcessById = Base + "/processes/get-process-by-id/{id}";
            public const string getProcessWithPagination = Base + "/processes";
            public const string permanenlyDelete = Base + "/processes/delete-permanenly/{id}";
            public const string softDeleteProcess = Base + "/processes/soft-delete/{id}";
            public const string updateProcessInfo = Base + "/processes/update-process-info";
            public const string getProcessByName = Base + "/processes/get-process-by-name/{name}";
            public const string getProcessDataOfProcess = Base + "/processes/{id}/processData";
            public const string getProcessesForSelect = Base + "/proceesses/get-for-select";
        }

        public static class SubProcess
        {
            public const string createSubProcess = Base + "/subProcesses";
            public const string getSubProcessById = Base + "/subProcesses/get-subProcesses-by-id/{id}";
            public const string getSubProcessWithPagination = Base + "/subProcesses";
            public const string permanenlyDelete = Base + "/subProcesses/delete-permanenly/{id}";
            public const string softDeleteSubProcess = Base + "/subProcesses/soft-delete/{id}";
            public const string updateSubProcessInfo = Base + "/subProcesses/update-subProcesses-info";
            public const string getSubProcessByName = Base + "/subProcesses/get-subProcesses-by-name/{name}";
            public const string getProcessDataOfSubProcess = Base + "/subProcesses/{id}/processData";
        }

        public static class MasterTypeDetail
        {
            public const string createMasterTypeDetail = Base + "/masterTypeDetails";
            public const string getMasterTypeDetailById = Base + "/masterTypeDetails/get-masterTypeDetail-by-id/{id}";
            public const string getMasterTypeDetailWithPagination = Base + "/masterTypeDetails";
            public const string permanenlyDelete = Base + "/masterTypeDetails/delete-permanenly/{id}";
            public const string updateMasterTypeDetailInfo = Base + "/masterTypeDetails/update-masterTypeDetail-info";
            public const string getMasterTypeDetailByName = Base + "/masterTypeDetails/get-masterTypeDetail-by-name/{name}";
        }
        public static class LandRow
        {
            public const string prefix = Base + "/landRows";
            public const string createLandRow = prefix + "";
            public const string deleteLandRow = prefix + "";
            public const string updateLandRowInfo = prefix + "";
            public const string getLandRowById = prefix + "";
            public const string getLandRowOfPlot = prefix + "/get-land-rows-of-plot";
        }

        public static class Plant
        {
            public const string prefix = Base + "/plants";
            public const string createPlant = prefix + "";
            public const string deletePlant = prefix + "";
            public const string deleteMultiplePlant = prefix + "/delete-multiple-plant";
            public const string updatePlantInfo = prefix + "";
            public const string getPlantById = prefix + "";
            public const string getPlantOfPlot = prefix + "/get-plants-of-plot";
            public const string getPlantOfFarm = prefix + "/get-plants-of-farm";
            public const string importPlantFromExcel = prefix + "/import-excel";
        }

        public static class PlantGrowthHistory
        {
            public const string prefix = Base + "/plant-growth-history";
            public const string createPlantGrowthHistory = prefix + "";
            public const string deletePlantGrowthHistory = prefix + "";
            public const string updatePlantGrowthHistoryInfo = prefix + "";
            public const string getPlantGrowthHistoryById = prefix + "";
            public const string getAllHistoryOfPlantById = prefix + "/get-plant-growth-history-of-plant";
        }

        public static class Plan
        {
            public const string prefix = Base + "/plan";
            public const string createPlan = prefix + "";
            public const string getPlanWithPagination = prefix + "";
            public const string deletePlan = prefix + "/{id}";
            public const string updatePlanInfo = prefix + "";
            public const string getPlanById = prefix + "/get-plan-by-id/{id}";
            public const string softDeletePlan = prefix + "/soft-delete-plan/{id}";
            public const string unSoftDeletePlan = prefix + "/un-soft-delete-plan/{id}";
            public const string getPlanByName = prefix + "/get-plan-by-name/{name}";
            public const string getPlanByFarmId = prefix + "/get-for-select/{farm-id}";
        }

        public static class UserWorkLog
        {
            public const string prefix = Base + "/user-work-log";
            public const string createUserWorkLog = prefix + "";
            public const string getUserWorkLogWithPagination = prefix + "";
            public const string deleteUserWorkLog = prefix + "/{id}";
            public const string updateUserWorkLogInfo = prefix + "";
            public const string getUserWorkLogById = prefix + "/get-user-work-log-by-id/{id}";
            public const string softDeleteUserWorkLog = prefix + "/soft-delete-user-work-log";
            public const string getUserWorkLogByName = prefix + "/get-user-work-log-by-name/{name}";
            public const string CheckConflict = prefix + "/check-conflict-schedule";
            public const string CheckConflictByStartDateAndEndDate = prefix + "/check-conflict-schedule-by-startDate-endDate";
        }
        public static class LegalDocument
        {
            public const string prefix = Base + "/legal-documents";
            public const string createLegalDocument = prefix + "";
            public const string deleteLegalDocument = prefix + "";
            public const string updateLegalDocumentInfo = prefix + "";
            public const string getLegalDocumentById = prefix + "";
            public const string getAllLegalDocumentIfFarm = prefix + "/get-legal-document-of-farm";
        }

        public static class Crop
        {
            public const string prefix = Base + "/crops";
            public const string createCrop = prefix + "";
            public const string deletePanentlyCrop = prefix + "";
            public const string deleteSoftedCrop = prefix + "/delete-softed";
            public const string updateCropInfo = prefix + "";
            public const string getCropById = prefix + "";
            public const string getAllCropOfFarm = prefix + "/get-crop-of-farm";
            public const string getAllCropOfLandPlot = prefix + "/get-crop-of-landplot";
            public const string getAllCropOfLandPlotForSelect = prefix + "/get-crop-of-landplot-selected";
        }

        public static class Harvest
        {
            public const string prefix = Base + "/harvests";
            public const string createHarvest = prefix + "";
            public const string createHarvesTypeHistory = prefix + "/create-detail-of-harvest";
            public const string deletePermanentlyHarvest = prefix + "";
            public const string deleteHarvestType = prefix + "/delete-harvest-detail";
            public const string updateHarvestInfo = prefix + "";
            public const string updateHarvestTypeInfo = prefix + "/update-harvest-detail";
            public const string getHarvestById = prefix + "";
            public const string getAllHarvestPagin = prefix + "";
            public const string getPlantsHasHarvest = prefix + "/get-plant-has-harvest";
            //public const string getAllCropOfLandPlot = prefix + "/get-crop-of-landplot";
            //public const string getAllCropOfFarmForSelect = prefix + "/get-crop-of-farm-selected";
        }

        public static class WorkLog
        {
            public const string prefix = Base + "/work-log";
            public const string createWorkLog = prefix + "";
            public const string getWorkLogWithPagination = prefix + "";
            public const string deleteWorkLog = prefix + "/{id}";
            public const string updateWorkLogInfo = prefix + "";
            public const string getWorkLogById = prefix + "/get-work-log-by-id/{id}";
            public const string getWorkLogByName = prefix + "/get-work-log-by-name/{name}";
            public const string getSchedule = prefix + "/get-schedule";
            public const string getAllSchedule = prefix + "/get-all-schedule";
            public const string assignTask = prefix + "/assign-task";
            public const string addNewTask = prefix + "/add-new-task";
        }

        public static class Report
        {
            public const string prefix = Base + "/report";
            public const string CropCareReport = prefix + "/crop-care/{landPlotId}/{year}";
            public const string DashboardReport = prefix + "/dashboard/{farmId}";
            public const string MaterialsInStore = prefix + "/dashboard/{farmId}/materials-in-store";
            public const string ProductivityByPlot = prefix + "/dashboard/{farmId}/productivity-by-plot";
        }

        public static class TaskFeedback
        {
            public const string prefix = Base + "/task-feedback";
            public const string createTaskFeedback = prefix + "";
            public const string getTaskFeedbackWithPagination = prefix + "";
            public const string deleteTaskFeedback = prefix + "/{id}";
            public const string updateTaskFeedbackInfo = prefix + "";
            public const string getTaskFeedbackById = prefix + "/get-task-feedback-by-id/{id}";
            public const string getTaskFeedbackByManagerId = prefix + "/get-task-feedback-by-manager-id/{id}";
            public const string getTaskFeedbackByWorkLogId = prefix + "/get-task-feedback-by-work-log-id/{id}";
        }

        public static class Package
        {
            public const string prefix = Base + "/packages";
            public const string getAllPackage = prefix + "";
            public const string getPackageById = prefix + "";
        }
    }
}
