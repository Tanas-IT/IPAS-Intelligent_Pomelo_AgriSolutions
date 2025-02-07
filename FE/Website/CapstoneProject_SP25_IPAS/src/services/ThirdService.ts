import { GOOGLE_MAP_KEY, MAP_BOX_KEY } from "@/constants";
import { District, Province, Ward } from "@/payloads";
import axios from "axios";

// Function to fetch cities
export const fetchCities = async () => {
  try {
    const response = await axios.get("https://esgoo.net/api-tinhthanh/1/0.htm");
    const data = response.data;
    if (data.error === 0) {
      const cities: Province[] = data.data.map((city: Province) => ({
        id: city.id,
        name: city.name,
      }));
      return cities;
    } else {
      console.error("Error fetching cities:", data.error_text);
      return [];
    }
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

// Function to fetch districts by provinceId
export const fetchDistricts = async (provinceId: string) => {
  try {
    const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
    const data = response.data;
    if (data.error === 0) {
      const districts: District[] = data.data.map((district: District) => ({
        id: district.id,
        name: district.name,
      }));
      return districts;
    } else {
      console.error("Error fetching districts:", data.error_text);
      return [];
    }
  } catch (error) {
    console.error("Error fetching districts:", error);
    return [];
  }
};

// Function to fetch wards by districtId
export const fetchWards = async (districtId: string) => {
  try {
    const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
    const data = response.data;
    if (data.error === 0) {
      const wards: Ward[] = data.data.map((ward: Ward) => ({
        id: ward.id,
        name: ward.name,
      }));
      return wards;
    } else {
      console.error("Error fetching wards:", data.error_text);
      return [];
    }
  } catch (error) {
    console.error("Error fetching wards:", error);
    return [];
  }
};

export const getCoordinatesFromAddress = async (address: string) => {
  const MAPBOX_ACCESS_TOKEN = MAP_BOX_KEY.ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address,
  )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    } else {
      throw new Error("Not found coordinates");
    }
  } catch (error) {
    console.error("Error take coordinates", error);
    return null;
  }
};

// export const getCoordinatesFromAddress = async (address: string) => {
//   const GOOGLE_MAPS_API_KEY = GOOGLE_MAP_KEY.ACCESS_TOKEN // Thay bằng API Key của bạn
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//     address,
//   )}&key=${GOOGLE_MAPS_API_KEY}`;

//   try {
//     const response = await fetch(url);
    
//     const data = await response.json();
//     console.log(data);
//     if (data.results.length > 0) {
//       const { lat, lng } = data.results[0].geometry.location;
//       return { latitude: lat, longitude: lng };
//     } else {
//       throw new Error("Not found coordinates");
//     }
//   } catch (error) {
//     console.error("Error take coordinates", error);
//     return null;
//   }
// };
