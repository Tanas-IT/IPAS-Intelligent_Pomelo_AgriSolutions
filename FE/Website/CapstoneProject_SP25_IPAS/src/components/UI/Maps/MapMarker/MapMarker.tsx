import { Icons } from "@/assets";
import style from "./MapMarker.module.scss";

interface MapMarkerProps {
  label?: string;
}

const MapMarker: React.FC<MapMarkerProps> = ({ label = "Your Farm Address Here" }) => {
  return (
    <div className={style.markerWithLabel}>
      <div className={style.markerLabelWrapper}>
        <label className={style.markerLabel}>{label}</label>
      </div>
      <Icons.marker className={style.customIcon} />
    </div>
  );
};

export default MapMarker;
