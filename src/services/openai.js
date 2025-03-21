import axios from 'axios';

export const createChatCompletion = async (apiKey, messages) => {
  return axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 150,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const getJudgment = async (apiKey, story, personality) => {
  const prompt = `
    Read the following story and provide a judgment on whether the person is the asshole. 
    Start your response with "Verdict: [YTA/NTA/ESH/NAH]" followed by your reasoning. 
    ${personality.instruction}
    
    Story: ${story}
  `;

  const response = await createChatCompletion(apiKey, [
    { role: 'user', content: prompt }
  ]);

  return response.data.choices[0].message.content.trim();
};
