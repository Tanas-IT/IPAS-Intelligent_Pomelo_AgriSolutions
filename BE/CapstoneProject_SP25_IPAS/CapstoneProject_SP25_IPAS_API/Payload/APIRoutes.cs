using System.ComponentModel;

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
            public const string getLandPlotEmpty = prefix + "/have-empty-index";
            public const string getLandPlotById = prefix + "";
            public const string getForMap = prefix + "/get-for-mapped";

            public const string updateLandPlotCoordination = prefix + "/update-coordination";
            public const string updateLandPlotInfo = prefix + "/update-info";
            public const string deleteLandPlotOfFarm = prefix + "";
            public const string deleteSoftedLandPlotOfFarm = prefix + "/softed-delete";

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
            public const string searchUserByEmail = Base + "/users/search-by-email/";
        }

        public static class PlantLot
        {
            public const string createPlantLot = Base + "/plant-lots";
            public const string createPlantLotAdditional = Base + "/plant-lots/additional";
            public const string getPlantLotById = Base + "/get-plantLot-by-id/{id}";
            public const string getPlantLotWithPagination = Base + "/plantLots";
            public const string permanenlyDelete = Base + "/plant-lots/{id}";
            public const string updatePlantLotInfo = Base + "/plant-lots";
            public const string createManyPlantFromPlantLot = Base + "/create-many-plant";
            public const string FillPlantToPlot = Base + "/fill-plant-to-plot";
            public const string GetPlantPlotForSelected = Base + "/get-for-selected";
            public const string SoftedDeletePlantLot = Base + "/plant-lots/softed-delete";
            public const string checkCriteriaForLot = Base + "/plant-lots/criteria/check-criteria";
            public const string MarkUsedPlantLot = Base + "/plant-lots/mark-used";
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
            public const string getForSelected = Base + "/masterTypes/get-for-selected";
            public const string checkMasterTypeByTarget = Base + "/masterTypes/check-by-target";

        }

        public static class Criteria
        {
            public const string prefix = Base + "/criterias";
            public const string updateListCriteriaType = prefix + "/update-list-criteria";
            public const string getCriteriaById = prefix + "";
            public const string getCriteriaOfObject = prefix + "/get-criteria-of-object";
            public const string updateCriteriaInfo = prefix + "";
            public const string createMasTypeCriteria = prefix + "/create-master-type-criteria";
            public const string getCriteriaBySet = prefix + "/set-criteria";
            public const string getCriteriaSetPlantLotExcept = prefix + "/plantlot/get-for-selected/except";
            public const string getCriteriaSetGraftedExcept = prefix + "/grafted-plant/get-for-selected/except";
            public const string getCriteriaSetPlantExcept = prefix + "/plant/get-for-selected/except";
            public const string getCriteriaSetProductExcept = prefix + "/product/get-for-selected/except";
            public const string getCriteriaSetPagin = prefix + "/criteria-set";
            public const string prefixCriteriaTarget = Base + "/criterias/target";
            public const string applyCriteriaTargetMultiple = prefixCriteriaTarget + "/apply-criteria";
            public const string updateCriteriaTarget = prefixCriteriaTarget + "/update-criteria-target";
            public const string updateCriteriaMultipleTarget = prefixCriteriaTarget + "/update-multiple-target";
            public const string checkCriteriaForGrafted = prefixCriteriaTarget + "/grafted-plant/check-criteria";
            public const string checkCriteriaForPlant = prefixCriteriaTarget + "/plant/check-criteria";
            public const string deleteCriteriaMultipleTarger = prefixCriteriaTarget + "/delete-for-multiple-target";
            public const string applyCriteriaForPlant = prefixCriteriaTarget + "/plant/apply-criteria";
            public const string resetPlantCriteria = prefixCriteriaTarget + "/plant/reset-criteria";
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
            public const string getForSelected = Base + "/partners/get-for-selected";
            public const string softedDeletePartner = Base + "/partners/softed-delete";

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
            public const string getProcessSelectedByMasterType = Base + "/processes/for-selected-by-master-type";
            public const string getProcessWithPagination = Base + "/processes";
            public const string getProcessById = Base + "/processes/get-process-by-id/{id}";

            public const string permanenlyDelete = Base + "/processes/delete-permanenly/{id}";
            public const string softDeleteProcess = Base + "/processes/soft-delete";
            public const string updateProcessInfo = Base + "/processes/update-process-info";
            public const string getProcessByName = Base + "/processes/get-process-by-name/{name}";
            public const string getProcessDataOfProcess = Base + "/processes/{id}/processData";
            public const string getProcessesForSelect = Base + "/proceesses/get-for-select";
            public const string getProccessByTypeName = Base + "/proceesses/get-by-type-name";
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
            public const string getLandRowOfPlotNoPagin = prefix + "/get-land-rows-of-plot";
            public const string getLandRowForSelected = prefix + "/get-for-selected";
            public const string getLandRowOfPlotPagin = prefix + "/get-land-rows-of-plot-pagin";
            public const string softedDeleteMultipleRow = prefix + "/softed-delete";
            public const string getSelectedIndexEmptyInRow = prefix + "/get-for-selected/index-empty";

        }

        public static class Plant
        {
            public const string prefix = Base + "/plants";
            public const string createPlant = prefix + "";
            public const string deletePlant = prefix + "";
            public const string deleteMultiplePlant = prefix + "/delete-multiple-plant";
            public const string updatePlantInfo = prefix + "";
            public const string getPlantById = prefix + "";
            public const string getPlantByCode = prefix + "/get-by-code";
            //public const string getPlantOfPlot = prefix + "/get-plants-of-plot";
            //public const string getPlantOfFarm = prefix + "/get-plants-of-farm";
            public const string importPlantFromExcel = prefix + "/import-excel";
            public const string getForSelectedForRow = prefix + "/get-for-selected-by-row";
            public const string getForSelectedForPlot = prefix + "/get-for-selected-by-plot";
            public const string getForSelectedActFunc = prefix + "/get-for-selected/active-function";
            public const string getPlantPagin = prefix + "/get-plants-pagin";
            public const string softDeletePlant = prefix + "/soft-delete";
            public const string getPlantNotLocate = prefix + "/get-for-selected/not-yet-plant";
            public const string getPlantByGrowthFunc = prefix + "/get-for-selected/growth-stage-function";
            public const string PlantDeadMark = prefix + "/dead-mark";
        }

        public static class PlantGrowthHistory
        {
            public const string prefix = Base + "/plant-growth-history";
            public const string createPlantGrowthHistory = prefix + "";
            public const string deletePlantGrowthHistory = prefix + "";
            public const string updatePlantGrowthHistoryInfo = prefix + "";
            public const string getPlantGrowthHistoryById = prefix + "";
            public const string getAllHistoryOfPlantPagin = prefix + "/pagin";
            public const string getAllHistoryOfPlantById = prefix + "/get-growth-history-of-plant";
        }

        public static class Plan
        {
            public const string prefix = Base + "/plan";
            public const string createPlan = prefix + "";
            public const string createManyPlan = prefix + "/create-many";
            public const string getPlanWithPagination = prefix + "";
            public const string getPlanByProcessId = prefix + "/get-plan-by-process-id/{id}";
            public const string deletePlan = prefix + "/{id}";
            public const string deleteManyPlan = prefix + "";
            public const string updatePlanInfo = prefix + "";
            public const string getPlanById = prefix + "/get-plan-by-id/{id}";
            public const string softDeletePlan = prefix + "/soft-delete-plan";
            public const string unSoftDeletePlan = prefix + "/un-soft-delete-plan/{id}";
            public const string getPlanByName = prefix + "/get-plan-by-name/{name}";
            public const string getPlanByFarmId = prefix + "/get-for-select/{farm-id}";
            public const string filterByGrowthStage = prefix + "/filter-by-growth-stage";
            public const string filterTypeWorkByGrowthStage = prefix + "/type-work/filter-by-growth-stage";
            public const string filterTypeNameByGrowthStage = prefix + "/type-name/filter-by-growth-stage";
            public const string getPlanOfTarget = prefix + "/get-plan-of-target";

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
            public const string getCropInCurrentTime = prefix + "/get-crop-in-current-time";
            public const string getLandPlotOfCrop = prefix + "/get-landPlot-of-crop/{cropId}";
            public const string getAllCropOfFarmSelected = prefix + "/for-selected/crop-of-farm";
        }

        public static class Harvest
        {
            public const string prefix = Base + "/harvests";
            public const string createHarvest = prefix + "";
            public const string createProductHarvestHistory = prefix + "/product-harvest";
            public const string createPlantRecordHarvest = prefix + "/plants/record";
            public const string deletePermanentlyHarvest = prefix + "";
            public const string deleteProductHarvest = prefix + "/delete-product";
            public const string deletePlantRecord = prefix + "/delete-plant-record";
            public const string SoftedDeletedHarvestHistory = prefix + "/softed-delete";
            public const string updateHarvestInfo = prefix + "";
            public const string updateProductHarvestInfo = prefix + "/update-product-harvest";
            public const string getHarvestById = prefix + "";
            public const string getAllHarvestPagin = prefix + "";
            public const string getPlantsHasHarvest = prefix + "/get-plant-has-harvest";
            public const string getHarvestForSelectedByPlotId = prefix + "/for-selected";
            public const string getProductInHarvestForSelected = prefix + "/for-selected/product-in-harvest";
            public const string statisticOfPlantByYear = prefix + "/statistic/plant-in-year";
            public const string getHarvestByCode = prefix + "/get-by-code";
            public const string statisticOfTopByYear = prefix + "/statistic/top-in-year";
            public const string statisticOfTopByCrop = prefix + "/statistic/top-in-crop";
            public const string getPlantHarvestRecord = prefix + "/plants/record";
            public const string getHarvestSelectedToPlantRecord = prefix + "/plants/can-harvert";
            public const string importPlantFromExcel = prefix + "/plant/record/import-excel";

            //public const string getAllCropOfLandPlot = prefix + "/get-crop-of-landplot";
            //public const string getAllCropOfFarmForSelect = prefix + "/get-crop-of-farm-selected";
        }

        public static class WorkLog
        {
            public const string prefix = Base + "/work-log";
            public const string createWorkLog = prefix + "";
            public const string getWorkLogWithPagination = prefix + "";
            public const string deleteWorkLog = prefix + "/{id}";
            public const string addNewWorkLog = prefix + "/add-new-worklog";
            public const string updateStatusOfWorkLog = prefix + "/update-status-of-workLog";
            public const string updateWorkLogInfo = prefix + "";
            public const string getWorkLogById = prefix + "/get-work-log-by-id/{id}";
            public const string getWorkLogByName = prefix + "/get-work-log-by-name/{name}";
            public const string getSchedule = prefix + "/get-schedule";
            public const string getAllSchedule = prefix + "/get-all-schedule";
            public const string assignTask = prefix + "/assign-task";
            public const string addNewTask = prefix + "/add-new-task";
            public const string getDetailTask = prefix + "/detail/{workLogId}";
            public const string NoteForWorkLog = prefix + "/take-note";
            public const string ReAssignTask = prefix + "/re-assign";
            public const string ChangeEmployeeOfWorkLog = prefix + "/change-employee";
            public const string CanceledWorkLogByEmployee = prefix + "/cancelled-workLog";
            public const string CheckAttendance = prefix + "/check-attendance";
            public const string UpdateNoteForWorkLog = prefix + "/update-note";
            public const string StatisticWorkLog = prefix + "/employee/task-stats";
            public const string GetWorkLogByStatusAndUserId = prefix + "/get-by-status-and-userId";
            public const string GetAttendanceList = prefix + "/get-attendance-list";
            public const string CancelReplacement = prefix + "/cancel-replacment";
            public const string GetListEmployeeToUpdate = prefix + "/get-list-employee-to-update";
            public const string CanTakeAttendance = prefix + "/can-take-attendance";
            public const string RedoWorkLog = prefix + "/redo-work-log";
            public const string GetStatusOfWorkLogForManager = prefix + "/status-work-log-for-manager";
            public const string GetStatisticForEmployee = prefix + "/statistic-employee";
            public const string FilterEmployeeByWorkLogId = prefix + "/filter-employee";

        }

        public static class Report
        {
            public const string prefix = Base + "/report";
            public const string CropCareReport = prefix + "/crop-care";
            public const string DashboardReport = prefix + "/dashboard";
            public const string MaterialsInStore = prefix + "/dashboard/materials-in-store";
            public const string ProductivityByPlot = prefix + "/dashboard/productivity-by-plot";
            public const string PomeloQualityBreakdown = prefix + "/dashboard/pomelo-quality-breakdown";
            public const string SeasonYield = prefix + "/dashboard/season-yield";
            public const string WorkProgressOverview = prefix + "/dashboard/work-progress-overview";
            public const string GetWeatherOfFarm = prefix + "/dashboard/get-weather-of-farm";
            public const string StatisticEmployee = prefix + "/dashboard/statistic-employee";
            public const string StatisticPlan = prefix + "/dashboard/statistic-plan";
            public const string WorkPerformance = prefix + "/dashboard/work-performance";
            public const string CompareWorkPerformance = prefix + "/dashboard/compare-work-performance";
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

        public static class GraftedPlant
        {
            public const string prefix = Base + "/grafted-plant";
            public const string createGrafted = prefix + "";
            public const string deletePermanentlyGrafted = prefix + "";
            public const string updateGraftedInfo = prefix + "";
            public const string deleteSoftedGrafted = prefix + "/softed-delete";
            public const string getGraftedById = prefix + "";
            public const string getAllGraftedPagin = prefix + "";
            public const string getGraftedForSelectedByFarmId = prefix + "/get-for-selected";
            public const string getHistoryOfGraftedPlantById = prefix + "/history";
            public const string getAllGraftedByPlantPagin = prefix + "/get-by-plant";

            public const string checkGraftedHasApplyCriteria = prefix + "/check-apply-criteria";
            public const string CompleteGraftedPlant = prefix + "/completed-and-cutting";
            public const string GroupGraftedPlantsIntoPlantLot = prefix + "/grouping";
            public const string UnGroupGraftedPlantsIntoPlantLot = prefix + "/ungrouping";
            public const string MarkDeadGraftedPlants = prefix + "/mark-dead";
            public const string CreatePlantFromGrafted = prefix + "/create-plant";

            public const string graftedNotePrefix = prefix + "/note";
            public const string createGraftedNote = graftedNotePrefix + "";
            public const string deleteGraftedNote = graftedNotePrefix + "";
            public const string updateGraftedNoteInfo = graftedNotePrefix + "";
            public const string getGraftedNoteById = graftedNotePrefix + "";
            public const string getAllNoteOfGraftedById = graftedNotePrefix + "/get-note-of-grafted";
            public const string getAllNoteOfGraftedPagin = graftedNotePrefix + "/pagin";
            public const string exportCSV = graftedNotePrefix + "/export-csv";

        }

        public static class AI
        {
            public const string prefix = Base + "/ai";
            public const string chatbox = prefix + "/chat";
            public const string predictDiseaseByFile = prefix + "/predict-disease-by-file";
            public const string predictDiseaseByURL = prefix + "/predict-disease-by-url";
            public const string getHistoryOfChat = prefix + "/history-of-chat";
            public const string getAllTags = prefix + "/get-all-tags";
            public const string createTag = prefix + "/create-tag";
            public const string deleteTag = prefix + "/delete-tag/{tagId}";
            public const string uploadImageByLink = prefix + "/upload-image-by-link";
            public const string uploadImageByFile = prefix + "/upload-image-by-file";
            public const string deleteImage = prefix + "/delete-image";
            public const string getAllImageAsync = prefix + "/get-all-image";
            public const string getImageUntaggedAsync = prefix + "/get-image-untagged";
            public const string getImageTaggedAsync = prefix + "/get-image-tagged";
            public const string updateTag = prefix + "/update-tag";
            public const string trainedProject = prefix + "/trained-project";
            public const string publishIteration = prefix + "/publish-iteration";
            public const string getAllRoom = prefix + "/get-all-room";
            public const string changeNameOfRoom = prefix + "/change-name-of-room";
            public const string deleteRoom = prefix + "/delete-room";
            public const string updateTagOfImage = prefix + "/update-tag-of-image";
        }


        public static class Order
        {
            public const string prefix = Base + "/order";
            public const string createOrder = prefix + "";
            public const string FarmOrder = prefix + "/farm";
            public const string deletePermanentlyOrder = prefix + "";
            public const string updateOrderInfo = prefix + "";
            public const string deleteSoftedOrder = prefix + "/softed-delete";
            public const string getOrders = prefix + "";
        }

        public static class Payment
        {
            public const string createPaymentLinkPayOS = Base + "/payment/payOS/create-payment-link";
            public const string getPaymentInfo = Base + "/payment/get-payment-information";
            public const string handdlePayment = Base + "/payment/handle-payment";
        }

        public static class Notification
        {
            public const string createNotification = Base + "/create-notification";
            public const string getNotificationByUserId = Base + "/notification";
            public const string markNotificationIsRead = Base + "/mark-notification-is-read";
        }

        public static class GrowthStageMasterType
        {
            public const string prefix = Base + "/growthStage-masterType";
            public const string createGrowthStageMasterType = prefix + "/create";
            public const string getGrowthStageMasterType = prefix + "";
            public const string updateGrowthStageMasterTypeInfo = prefix + "";
            public const string deleteGrowthStageMasterType = prefix + "/delete";
        }
        public static class ProductCriteriaSet
        {
            public const string prefix = Base + "/products";
            public const string getCriteriaSetOfProduct = prefix + "/criteria-set";
            public const string getForSelectedProduct = prefix + "/criteria-set/get-for-selected";
            public const string DeleteCriteriaSetFromProduct = prefix + "/criteria-set";
            public const string UpdateCriteriaSetStatus = prefix + "/criteria-set";
            public const string ApplyCriteriaSetToProduct = prefix + "/criteria-set";
        }

        public static class ReportOfUser
        {
            public const string prefix = Base + "/report-of-user";
            public const string getAllReportOfUser = prefix + "/get-all";
            public const string getAllReportOfUserWithPagin = prefix + "/get-all-with-pagin";
            public const string createReportOfUser = prefix + "/create";
            public const string DeleteReportOfUser = prefix + "/delete";
            public const string UpdateReportOfUser = prefix + "/update";
            public const string AssignTagToImageinReportOfUser = prefix + "/assign-tag-to-image";
            public const string getReportOfUser = prefix + "/get-report-of-user";
            public const string answerReportOfUser = prefix + "/answer-report";
        }

        public static class SystemConfig
        {
            private const string prefix = Base + "/system-config";
            public const string createSystemConfig = prefix;
            public const string getSystemConfigById = prefix;
            public const string getSystemConfigPagination = prefix;
            public const string permanenlyDelete = prefix;
            public const string updateSystemConfig = prefix;
            public const string getSystemConfigForSelected = prefix + "/for-selected";
            public const string getSystemConfigAddable = prefix + "/addable";
            public const string getSystemConfigGroup = prefix + "/group/for-selected";
            public const string getSystemConfigNoPagin = prefix + "/no-pagin";

        }
        public static class Schedule
        {
            private const string prefix = Base + "/schedule";
            public const string updateTimeAndEmployee = prefix + "/update-time-and-employee";
            public const string changeTimeOfSchedule = prefix + "/change-time-of-schedule";
        }
    }
}
