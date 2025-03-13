import { useEffect } from "react";
import { useFarmStore } from "@/stores";
import { farmService } from "@/services";
import { getFarmId } from "@/utils";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";

const useFarmExpiration = () => {
    const { setFarmInfo } = useFarmStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFarmExpiration = async () => {
            try {
                const farmId = getFarmId();
                if (farmId) {
                    const farmInfo = await farmService.getFarm(farmId);
                    const farmExpiredDate = farmInfo.data.farmExpiredDate;
                    setFarmInfo(farmInfo.data.farmName, farmInfo.data.logoUrl, farmInfo.data.farmExpiredDate);
                    if (!farmExpiredDate) {
                        toast.warning("You need to purchase a package before using this farm.");
                        navigate(PATHS.PACKAGE.PACKAGE_PURCHASE);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch farm expiration:", error);
            }
        };

        fetchFarmExpiration();
    }, [setFarmInfo, navigate]);
};

export default useFarmExpiration;