import { useEffect, useState } from "react";
import style from "./PricingSection.module.scss";
import PricingCard from "@/components/UI/PricingCard/PricingCard";
import AOS from "aos";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { packageService } from "@/services";
import { ApiResponse } from "@/payloads";
import { GetPackage } from "@/payloads/package";

interface PackageDetail {
    packageDetailId: number;
    packageDetailCode: string;
    featureName: string;
    featureDescription: string;
    packageId: number;
}

interface Package {
    packageId: number;
    packageName: string;
    packagePrice: number;
    duration: number;
    packageDetails: PackageDetail[];
}

const PricingSection: React.FC = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<Package[]>([]);

    useEffect(() => {
            const fetchPackage = async () => {
                const result: ApiResponse<GetPackage[]> = await packageService.getPackagePurchase();
                if (result.statusCode === 200) {
    
                    setPackages(result.data);
                }
            }
            fetchPackage();
    
        }, []);

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: "ease-in-out",
            // once: false,
        });
    }, []);

    const handleChoosePlan = (packageId: number) => {
        // navigate(`${PATHS.PACKAGE.PAYMENT}/${packageId}`);
    };

    return (
        <section className={style.pricingSection}>
            <p className={style.text1} data-aos="fade-up">
                Our Services
            </p>
            <p className={style.text2} data-aos="fade-up" data-aos-delay="200">
                Best Agriculture Services
            </p>
            <div className={style.pricingCards}>
                {packages.map((pkg, index) => (
                    <div
                        key={pkg.packageId}
                        data-aos="zoom-in"
                        data-aos-delay={`${index * 100}`}
                    >
                        <PricingCard
                            packageName={pkg.packageName}
                            packagePrice={pkg.packagePrice}
                            duration={pkg.duration}
                            packageDetails={pkg.packageDetails}
                            onNavigate={() => handleChoosePlan(pkg.packageId)}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PricingSection;