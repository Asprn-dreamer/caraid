import { GoogleGenAI, Type } from "@google/genai";
import { FaultDiagnosis, KnowledgeEntry } from "../types";

export const analyzeProductFault = async (
  productName: string,
  category: string,
  description: string,
  sourceRegion: string,
  history: FaultDiagnosis[] = [],
  knowledge: KnowledgeEntry[] = [],
  imageData?: string
): Promise<FaultDiagnosis['result']> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = 'gemini-3-flash-preview'; 
  
  const relevantHistory = history
    .filter(h => (h.productName === productName || h.category === category))
    .slice(0, 3) 
    .map(h => ({
      issue: h.description,
      actual: h.actualResult || "未核实"
    }));

  const relevantKnowledge = knowledge
    .filter(k => 
      k.productName.includes(productName) || 
      description.includes(k.location)
    )
    .slice(0, 3);

  const prompt = `你是一个顶级的产品失效分析工程师。请对以下产品故障进行深度分析。
  
  产品: ${productName} (${category})
  地域环境: ${sourceRegion}
  故障现象: ${description}

  要求：
  1. 结合省份地理气候特征（如高盐雾、极端低温、风沙等）。
  2. 给出详细的故障分析结论。结论应侧重于描述“可能出现的问题/故障性质”（例如：电机绕组过热烧毁、内部密封失效导致进水等），而不仅仅是列出故障位置。
  3. 分析逻辑必须包含物理失效路径的推演。
  
  参考历史: ${JSON.stringify(relevantHistory)}
  参考专家库: ${JSON.stringify(relevantKnowledge)}`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          ...(imageData ? [{ inlineData: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } }] : [])
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faultIssue: { type: Type.STRING, description: "可能出现的问题描述，如‘压力泵密封圈磨损导致内漏’" },
          confidence: { type: Type.NUMBER },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          reasoning: { type: Type.STRING },
          suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["faultIssue", "confidence", "severity", "reasoning", "suggestedActions"]
      }
    }
  });

  try {
    const text = response.text;
    const parsed = JSON.parse(text);
    
    return {
      ...parsed,
      estimatedRepairCost: ""
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("诊断引擎响应异常，请重试。");
  }
};
