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
            public const string getFarmById = prefix + "/get-farm-by-id";
            public const string getAllFarmOfUser = prefix + "/get-farm-of-user";
            public const string getFarmWithPagination = prefix + "";
            public const string permanenlyDelete = prefix + "/delete-permanenly";
            public const string softedDeleteFarm = prefix + "/softed-delete-farm";
            public const string updateFarmInfo = prefix + "/update-farm-info";
            public const string updateFarmLogo = prefix + "/update-farm-logo";
            public const string updateFarmCoordination = prefix + "/update-farm-coordination";
        }

        public static class LandPlot
        {
            public const string prefix = Base + "/landplots";
            public const string createLandPlot = prefix + "";
            public const string getAllLandPlotNoPagin = prefix + "";
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
        }

        public static class Resource
        {
            public const string uploadImage = Base + "/resource/upload-image";
            public const string uploadvideo = Base + "/resource/upload-video";
            public const string deleteImageByURL = Base + "/resource/delete-image-by-url";
            public const string deleteVideoByURL = Base + "/resource/delete-video-by-url";
           
        }

        public static class CriteriaType
        {
            public const string createCriteriaType = Base + "/criteriaTypes";
            public const string getCriteriaTypeById = Base + "/criteriaTypes/get-criteriaType-by-id/{id}";
            public const string getCriteriaTypeWithPagination = Base + "/criteriaTypes";
            public const string permanenlyDelete = Base + "/criteriaTypes/delete-permanenly/{id}";
            public const string updateCriteriaTypeInfo = Base + "/criteriaTypes/update-criteriaType-info";
            public const string getCriteriaTypeByName = Base + "/criteriaTypes/get-criteriaType-by-name/{name}";
        }
        public static class Criteria
        {
            public const string prefix = Base + "/criterias";
            public const string updateListCriteriaType = prefix + "/update-list-criteria";
            public const string getCriteriaById = prefix + "/get-criteriaType-by-id/{id}";
            public const string updateCriteriaInfo = prefix + "/update-criteria-info";
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
            public const string createProcess = Base + "/processs";
            public const string createManyProcess = Base + "/processs/create-many";
            public const string getProcessById = Base + "/processs/get-process-by-id/{id}";
            public const string getProcessWithPagination = Base + "/processs";
            public const string permanenlyDelete = Base + "/processs/delete-permanenly/{id}";
            public const string softDeleteProcess = Base + "/processs/soft-delete/{id}";
            public const string updateProcessInfo = Base + "/processs/update-process-info";
            public const string getProcessByName = Base + "/processs/get-process-by-name/{name}";
            public const string getProcessDataOfProcess = Base + "/processs/{id}/processData";
        }

        public static class SubProcess
        {
            public const string createSubProcess = Base + "/subProcesss";
            public const string getSubProcessById = Base + "/subProcesss/get-subProcess-by-id/{id}";
            public const string getSubProcessWithPagination = Base + "/subProcesss";
            public const string permanenlyDelete = Base + "/subProcesss/delete-permanenly/{id}";
            public const string softDeleteSubProcess = Base + "/subProcesss/soft-delete/{id}";
            public const string updateSubProcessInfo = Base + "/subProcesss/update-subProcess-info";
            public const string getSubProcessByName = Base + "/subProcesss/get-subProcess-by-name/{name}";
            public const string getProcessDataOfSubProcess = Base + "/subProcesss/{id}/processData";
        }

    }
}
