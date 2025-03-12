import style from "./PricingCard.module.scss";

interface PackageDetail {
    packageDetailId: number;
    packageDetailCode: string;
    featureName: string;
    featureDescription: string;
    packageId: number;
}

interface PricingCardProps {
    packageName: string;
    packagePrice: number;
    duration: number;
    packageDetails: PackageDetail[];
    onNavigate: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ packageName, packagePrice, duration, packageDetails, onNavigate }) => {
    const nameColorMapping: Record<string, string> = {
        "Basic Package": "#FF5733",
        "Standard Package": "#175AE4",
        "Premium Package": "#8B5CF6",
    };

    const nameColor = nameColorMapping[packageName] || "#000";

    return (
        <div className={style.pricingCard}>
            <h3 style={{ color: nameColor }}>{packageName}</h3>
            <div className={style.priceDuration}>
                <p className={style.price}>${packagePrice.toFixed(2)}</p>
                <p className={style.duration}>{duration} days</p>
            </div>
            <ul>
                {packageDetails.map((detail) => (
                    <li key={detail.packageDetailId}>
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.3382 0C4.62855 0 0 4.47715 0 10C0 15.5228 4.62855 20 10.3382 20C16.0478 20 20.6763 15.5228 20.6763 10C20.6697 4.47982 16.045 0.00642897 10.3382 0Z" fill="#BCD379" />
                            <path d="M16.306 6.83313L10.409 14.574C10.2683 14.7545 10.0586 14.8727 9.82695 14.9022C9.59529 14.9316 9.3611 14.8698 9.17701 14.7306L4.96593 11.474C4.59433 11.1863 4.53416 10.6617 4.83153 10.3023C5.12891 9.94285 5.67122 9.88465 6.04282 10.1723L9.55435 12.8898L14.919 5.8473C15.0949 5.59195 15.4017 5.45078 15.7175 5.47983C16.0333 5.50887 16.307 5.70344 16.43 5.98627C16.553 6.26911 16.5054 6.59445 16.306 6.83313Z" fill="#5B8C51" />
                        </svg>
                        {detail.featureName}
                    </li>
                ))}
            </ul>
            <button onClick={onNavigate}>Choose Plan</button>
        </div>
    );
};

export default PricingCard;
