
import { LOCAL_LOCATIONS } from "./locationData";

/**
 * Tìm kiếm địa chỉ hành chính từ bộ nhớ cục bộ (Hà Nội & Giao Thủy)
 * Không sử dụng AI để đảm bảo tốc độ và sự ổn định tuyệt đối.
 */
export const searchPlaces = async (query: string) => {
  if (!query || query.length < 1) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Lọc trực tiếp từ danh sách LOCAL_LOCATIONS đã định nghĩa
  const matches = LOCAL_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(normalizedQuery) || 
    loc.shortName.toLowerCase().includes(normalizedQuery)
  );

  return matches.slice(0, 6).map(item => ({
    name: item.name,
    shortName: item.shortName,
    uri: `https://www.google.com/maps/search/${encodeURIComponent(item.name)}`
  }));
};

/**
 * Lấy thông tin lộ trình - Tạm thời trả về thông báo bảo trì
 */
export const getRouteDetails = async (origin: string, destination: string) => {
  return { 
    text: "Tính năng phân tích lộ trình thông minh đang được nâng cấp để hoạt động ổn định hơn.", 
    links: [] 
  };
};

/**
 * Chat với trợ lý - Tạm thời trả về phản hồi tĩnh
 */
export const chatWithAssistant = async (message: string, context: string) => {
  return "Chào bạn! Tính năng trợ lý AI thông minh hiện đang được bảo trì để nâng cấp hệ thống. Vui lòng quay lại sau hoặc liên hệ tổng đài để được hỗ trợ trực tiếp.";
};
