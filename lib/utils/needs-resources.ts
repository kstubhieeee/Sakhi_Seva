export async function needsResources(
  message: string, 
  history: Array<{ role: string; content: string }>,
  ai: any
): Promise<boolean> {
  const contextHistory = history.length > 0 
    ? `Previous conversation:\n${history.slice(-5).map((h: any) => `${h.role}: ${h.content}`).join('\n')}\n\n`
    : '';

  const prompt = `${contextHistory}User question: "${message}"

Analyze if this question requires external resources (YouTube videos, articles, blogs) to answer properly.

Return ONLY "true" or "false" - no other text.

Return "true" if the user is asking to:
- Learn something new
- Get tutorials, guides, or courses
- Find resources, articles, or videos
- Get recommendations or suggestions
- Understand a concept that needs examples

Return "false" if the user is:
- Asking a simple follow-up question (yes, no, thanks, ok, etc.)
- Asking for clarification on a previous answer
- Having a casual conversation
- Asking a quick question that doesn't need external resources`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const result = (response.text || "").trim().toLowerCase();
    return result === "true";
  } catch (error) {
    console.error("Error determining if resources needed:", error);
    const lowerMessage = message.toLowerCase().trim();
    const followUpPatterns = [
      /^(yes|no|ok|okay|thanks|thank you|got it|understood|alright|sure|fine)$/i,
    ];
    return !followUpPatterns.some(pattern => pattern.test(lowerMessage));
  }
}

