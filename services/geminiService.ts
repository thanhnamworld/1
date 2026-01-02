
import { GoogleGenAI, Type } from "@google/genai";
import { LOCAL_LOCATIONS } from "./locationData";

// Khởi tạo AI một cách an toàn
const getAIInstance = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key is missing. Please set API_KEY in environment variables.");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI:", e);
    return null;
  }
};

/**
 * Tìm kiếm địa chỉ hành chính từ bộ nhớ cục bộ (Hà Nội & Giao Thủy)
 */
export const searchPlaces = async (query: string) => {
  if (!query || query.length < 1) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
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

export const getRouteDetails = async (origin: string, destination: string) => {
  const ai = getAIInstance();
  if (!ai) return { text: "AI đang tạm nghỉ, vui lòng thử lại sau.", links: [] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Phân tích lộ trình từ "${origin}" đến "${destination}". Tính quãng đường và thời gian dự kiến.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return { text: response.text, links: [] };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Không thể lấy thông tin lộ trình lúc này.", links: [] };
  }
};

export const chatWithAssistant = async (message: string, context: string) => {
  const ai = getAIInstance();
  if (!ai) return "Xin lỗi, tôi chưa được cấp chìa khóa (API Key) để hoạt động.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${context}\n\nUser: ${message}`,
      config: {
        systemInstruction: "Bạn là trợ lý TripEase. Trả lời bằng tiếng Việt ngắn gọn, tập trung vào giá xe và lộ trình."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Assistant Error:", error);
    return "Xin lỗi, tôi đang bận một chút.";
  }
};
