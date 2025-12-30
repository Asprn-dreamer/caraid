
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
  // 严格遵循初始化规范
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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
  1. 首先判断输入信息是否有效。如果输入是乱码、与产品故障无关、或者描述过于模糊（如只写了“坏了”而没有任何现象）导致无法进行逻辑推演，请将 isInformationValid 设为 false，并在 invalidReason 中说明原因。
  2. 若信息有效，结合省份地理气候特征（如高盐雾、极端低温、风沙等）给出详细的故障分析结论。结论应侧重于描述“可能出现的问题/故障性质”。
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
          isInformationValid: { type: Type.BOOLEAN, description: "输入信息是否足以进行故障分析" },
          invalidReason: { type: Type.STRING, description: "如果信息无效，说明原因" },
          faultIssue: { type: Type.STRING, description: "可能出现的问题描述，如‘压力泵密封圈磨损导致内漏’" },
          confidence: { type: Type.NUMBER },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          reasoning: { type: Type.STRING },
          suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["isInformationValid"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response");
    const parsed = JSON.parse(text);

    if (!parsed.isInformationValid) {
      throw new Error(parsed.invalidReason || "录入信息无效或不足，无法生成准确的分析结果，请提供更详细的故障表现描述。");
    }
    
    return {
      faultIssue: parsed.faultIssue,
      confidence: parsed.confidence,
      severity: parsed.severity,
      reasoning: parsed.reasoning,
      suggestedActions: parsed.suggestedActions,
      estimatedRepairCost: ""
    };
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};
