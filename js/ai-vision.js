/**
 * VelaCraft Gemini 2.5 Flash Vision AI Adapter
 * Parses sketches and reference images directly in the browser via Google Generative Language API.
 */

class AIVision {
  constructor() {
    this.apiKey = localStorage.getItem("gemini_api_key") || "";
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem("gemini_api_key", this.apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.startsWith("AIzaSy"));
  }

  /**
   * Send sketch/image to Gemini Vision model for UI reverse engineering
   */
  async analyzeSketch(imageBase64, userPrompt = "") {
    if (!this.hasApiKey()) {
      throw new Error("请先在右上角【AI 配置】中填入您的 Gemini API Key（支持免费获取）。");
    }

    // Strip data:image/...;base64,
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

    const systemInstruction = `
你是一位专门将用户的手绘草图、原型涂鸦或参考截图逆向转换为智能手环（小米手环 10 Pro / 9 Pro / 8 Pro, 336x480 AMOLED）表盘界面的专家工程师。
请仔细观察用户绘制的草图结构与色彩。

你的任务是分析画面中的控件排版并提取配色与布局：
1. primaryColor: 画面中主时钟、数字的主色调 Hex 颜色代码（例如 #D4D4D8 哑光白, #00E5FF 赛博青蓝, #F59E0B 琥珀金, #CCFF00 荧光绿, #FF3344 竞速红）。
2. showStatus: 画面顶部是否有天气图标、气温、电量指示（true/false）。
3. showRibbon: 中部是否有月日、星期或秒数胶囊（true/false）。
4. showHealth: 底部是否有步数、心率、卡路里等运动健康数据（true/false）。
5. bigHrm: 中间或心率数字是否巨大突出（true/false）。
6. suggestedTitle: 为这个设计起一个高雅简短的表盘名字（例如：极简数字表盘、赛博数码、包豪斯德黑）。
7. analysis: 一句简明优雅的设计点评。

请严格仅返回 JSON 格式，不要包含任何 markdown 标记或额外解释。格式如下：
{
  "primaryColor": "#00E5FF",
  "showStatus": true,
  "showRibbon": true,
  "showHealth": true,
  "bigHrm": true,
  "suggestedTitle": "赛博青蓝数字",
  "analysis": "识别到顶部天气指示、中部巨型时钟与底部三列健康矩阵，赋予高能赛博青蓝色调。"
}
`.trim();

    const requestBody = {
      contents: [
        {
          parts: [
            { text: userPrompt ? `用户补充说明: ${userPrompt}\n请结合草图分析。` : "请分析这张手绘草图并逆向转换为表盘布局。" },
            {
              inline_data: {
                mime_type: "image/png",
                data: cleanBase64
              }
            }
          ]
        }
      ],
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.2,
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.error ? errJson.error.message : `HTTP ${response.status}`;
      throw new Error(`Gemini API 响应异常: ${msg}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error("模型未返回有效内容，请重试。");
    }

    try {
      const parsed = JSON.parse(candidate);
      return parsed;
    } catch (e) {
      // Fallback regex extraction if raw json formatting slightly deviates
      const match = candidate.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error("解析 AI 返回的 JSON 失败: " + candidate);
    }
  }
}

window.AIVision = new AIVision();
