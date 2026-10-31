/**
 * Multi-Model AI Router for UNMESS
 * Cascades across Groq -> Gemini -> OpenAI -> OpenRouter -> Local Smart Engine
 * Automatically fails over if a key is missing, rate-limited, or errors out.
 */

// Safe helper to extract JSON from model responses (even if wrapped in markdown codeblocks)
function cleanAndParseJSON(rawText) {
  let cleaned = rawText.trim();
  // Strip markdown ```json ... ``` blocks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '');
  }
  return JSON.parse(cleaned.trim());
}

// Normalizer to guarantee consistent schema across all model outputs
function normalizeOutput(rawResult, originalPrompt) {
  const result = typeof rawResult === 'object' && rawResult !== null ? rawResult : {};

  // Cleaned prose
  const cleanedProse = result.cleanedProse || result.summary || result.overview || "Chaos successfully organized into structured action units.";

  // Chaos score (1 - 10)
  const chaosScore = typeof result.chaosScore === 'number' 
    ? Number(result.chaosScore.toFixed(1)) 
    : 7.8;

  // Normalize tasks
  let rawTasks = Array.isArray(result.tasks) ? result.tasks : [];
  const tasks = rawTasks.map((t, idx) => {
    const title = typeof t === 'string' ? t : (t.title || t.task || t.name || `Task ${idx + 1}`);
    const prio = (t.priority && ['P1', 'P2', 'P3', 'P4'].includes(t.priority.toUpperCase())) 
      ? t.priority.toUpperCase() 
      : (t.priority === 'High' ? 'P1' : t.priority === 'Medium' ? 'P2' : 'P3');

    return {
      id: t.id || `task-${Date.now()}-${idx}`,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: t.description || t.details || title,
      priority: prio,
      urgencyScore: typeof t.urgencyScore === 'number' ? t.urgencyScore : (prio === 'P1' ? 9.5 : prio === 'P2' ? 8.0 : prio === 'P3' ? 6.0 : 3.5),
      estimatedTime: t.estimatedTime || t.duration || '45m',
      category: t.category || 'General',
      deadline: t.deadline || null,
      completed: false
    };
  });

  // Normalize deadlines
  let deadlines = [];
  if (Array.isArray(result.deadlines)) {
    deadlines = result.deadlines.map((d, idx) => ({
      id: d.id || `dl-${Date.now()}-${idx}`,
      title: d.title || d.task || (tasks[idx]?.title || 'Upcoming Milestone'),
      deadlineText: d.deadlineText || d.deadline || d.time || 'Scheduled',
    }));
  } else if (result.deadlines && typeof result.deadlines === 'object') {
    // If returned as key-value pairs { "Thursday 5pm": "Submit report" }
    deadlines = Object.entries(result.deadlines).map(([key, val], idx) => ({
      id: `dl-${Date.now()}-${idx}`,
      title: typeof val === 'string' ? val : (val.title || `Deadline ${idx + 1}`),
      deadlineText: key,
    }));
  }

  // Fallback: If no deadlines extracted explicitly, check tasks for deadlines
  if (deadlines.length === 0) {
    tasks.filter(t => t.deadline).forEach((t, idx) => {
      deadlines.push({
        id: `dl-from-task-${idx}`,
        title: t.title,
        deadlineText: t.deadline
      });
    });
  }

  // Normalize reminders
  let reminders = [];
  if (Array.isArray(result.reminders)) {
    reminders = result.reminders.map((r, idx) => ({
      id: r.id || `rem-${Date.now()}-${idx}`,
      text: typeof r === 'string' ? r : (r.text || r.task || r.note || 'Follow up on action item'),
      priority: r.priority || 'P2'
    }));
  }

  // Normalize ideas
  let ideas = [];
  if (Array.isArray(result.ideas)) {
    ideas = result.ideas.map((i, idx) => ({
      id: i.id || `idea-${Date.now()}-${idx}`,
      title: typeof i === 'string' ? i : (i.title || i.idea || 'Creative Spark'),
      details: i.details || i.notes || '',
      tags: Array.isArray(i.tags) ? i.tags : ['Insight']
    }));
  }

  // Normalize daily schedule
  let dailySchedule = [];
  if (Array.isArray(result.dailySchedule) && result.dailySchedule.length > 0 && typeof result.dailySchedule[0] === 'object') {
    dailySchedule = result.dailySchedule.map((s, idx) => ({
      taskId: s.taskId || tasks[idx]?.id || `block-${idx}`,
      title: s.title || tasks[idx]?.title || `Work Block ${idx + 1}`,
      timeSlot: s.timeSlot || s.time || (idx === 0 ? '09:00 - 11:30' : idx === 1 ? '11:45 - 12:30' : '14:00 - 15:30'),
      blockType: s.blockType || (idx === 0 ? 'Peak Cognitive (Deep Work)' : 'Standard Execution'),
      estimatedTime: s.estimatedTime || tasks[idx]?.estimatedTime || '1 hr',
      priority: s.priority || tasks[idx]?.priority || 'P2'
    }));
  } else {
    dailySchedule = generateDailySchedule(tasks);
  }

  return {
    cleanedProse,
    chaosScore,
    tasks,
    deadlines,
    reminders,
    ideas,
    dailySchedule
  };
}

// 1. Groq Provider
async function callGroq(apiKey, prompt, mode) {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  
  // Try qwen/qwen3.8-27b (highest tier & supports json_object)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(mode),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq HTTP ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  const parsed = cleanAndParseJSON(content);
  return {
    provider: 'Groq (Qwen 3.8)',
    result: normalizeOutput(parsed, prompt),
    tokens: data.usage?.total_tokens || Math.round(prompt.length / 4 + 200),
  };
}

// 2. Google Gemini Provider
async function callGemini(apiKey, prompt, mode) {
  // Use gemini-flash-latest
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  
  const systemInstruction = getSystemPrompt(mode);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nRAW INPUT TO UNMESS:\n${prompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty candidate');
  const parsed = cleanAndParseJSON(text);
  const totalTokens = data.usageMetadata?.totalTokenCount || Math.round(prompt.length / 4 + 220);

  return {
    provider: 'Google Gemini (Flash Latest)',
    result: normalizeOutput(parsed, prompt),
    tokens: totalTokens,
  };
}

// 3. OpenAI / ChatGPT Provider
async function callOpenAI(apiKey, prompt, mode) {
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: getSystemPrompt(mode) },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  const parsed = cleanAndParseJSON(content);
  return {
    provider: 'OpenAI (GPT-4o Mini)',
    result: normalizeOutput(parsed, prompt),
    tokens: data.usage?.total_tokens || Math.round(prompt.length / 4 + 210),
  };
}

// 4. OpenRouter Provider
async function callOpenRouter(apiKey, prompt, mode) {
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://unmess.app',
      'X-Title': 'UNMESS Task Organizer',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: getSystemPrompt(mode) },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter HTTP ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  const parsed = cleanAndParseJSON(content);
  return {
    provider: 'OpenRouter (Llama-3.1)',
    result: normalizeOutput(parsed, prompt),
    tokens: data.usage?.total_tokens || Math.round(prompt.length / 4 + 210),
  };
}

// 5. Intelligent Local Heuristic Engine (Fallback when offline or no keys)
function runLocalSmartExtractor(input, mode) {
  const text = input.trim();
  const sentences = text.split(/(?<=[.?!;\n])\s+/).filter(s => s.trim().length > 0);

  const tasks = [];
  const deadlines = [];
  const reminders = [];
  const ideas = [];

  const deadlineKeywords = /(by|before|until|due|at|on|tomorrow|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const reminderKeywords = /(remember to|don't forget|ping|check with|follow up|remind)/i;
  const ideaKeywords = /(maybe|idea|consider|what if|explore|investigate|brainstorm)/i;

  sentences.forEach((sentence, idx) => {
    const sLower = sentence.toLowerCase();
    const isDeadline = deadlineKeywords.test(sentence);
    const isReminder = reminderKeywords.test(sLower);
    const isIdea = ideaKeywords.test(sLower);

    let cleanTitle = sentence
      .replace(/^(hey|so|also|and|remember to|don't forget to|need to|have to|must|please)\s+/i, '')
      .trim();
    if (cleanTitle.length > 70) {
      cleanTitle = cleanTitle.substring(0, 67) + '...';
    }

    let priority = 'P3';
    let urgencyScore = 6;
    if (sLower.includes('urgent') || sLower.includes('asap') || sLower.includes('critical') || sLower.includes('deck') || sLower.includes('api key') || sLower.includes('budget')) {
      priority = 'P1';
      urgencyScore = 9.5;
    } else if (isDeadline || sLower.includes('today') || sLower.includes('tomorrow') || sLower.includes('sync')) {
      priority = 'P2';
      urgencyScore = 8;
    } else if (isIdea) {
      priority = 'P4';
      urgencyScore = 3;
    }

    let estTime = '30m';
    if (sLower.includes('deck') || sLower.includes('budget') || sLower.includes('report') || sLower.includes('project')) {
      estTime = '2.5 hrs';
    } else if (sLower.includes('ping') || sLower.includes('email') || sLower.includes('buy') || sLower.includes('call')) {
      estTime = '15m';
    } else if (sLower.includes('doctor') || sLower.includes('meeting') || sLower.includes('sync')) {
      estTime = '45m';
    }

    if (isIdea) {
      ideas.push({
        id: `idea-${Date.now()}-${idx}`,
        title: cleanTitle,
        details: sentence,
        tags: ['Creative', 'Potential'],
      });
    } else {
      const taskItem = {
        id: `task-${Date.now()}-${idx}`,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        description: sentence,
        priority: priority,
        urgencyScore: urgencyScore,
        estimatedTime: estTime,
        category: sLower.includes('doctor') || sLower.includes('buy') ? 'Personal' : 'Work',
        completed: false,
        deadline: isDeadline ? extractDateSnippet(sentence) : null,
      };
      tasks.push(taskItem);

      if (isDeadline) {
        deadlines.push({
          id: `dl-${Date.now()}-${idx}`,
          title: taskItem.title,
          deadlineText: extractDateSnippet(sentence) || 'Upcoming',
          associatedTaskId: taskItem.id,
        });
      }

      if (isReminder) {
        reminders.push({
          id: `rem-${Date.now()}-${idx}`,
          text: sentence,
          priority: priority,
        });
      }
    }
  });

  const cleanedParagraph = `Identified ${tasks.length} actionable items and ${ideas.length} exploratory notes. Immediate focus is directed toward ${tasks.filter(t => t.priority === 'P1').map(t => t.title).join(', ') || 'priority deliverables'}. Action items have been organized and scheduled into optimal cognitive timeline blocks.`;

  return {
    provider: 'UNMESS Local Heuristic (Instant)',
    result: {
      cleanedProse: cleanedParagraph,
      chaosScore: Math.min(10, Math.max(3.5, (sentences.length * 1.6).toFixed(1))),
      tasks,
      deadlines,
      reminders,
      ideas,
      dailySchedule: generateDailySchedule(tasks),
    },
    tokens: 0,
  };
}

function extractDateSnippet(text) {
  const match = text.match(/(?:by|before|on|at|due|next)\s+([^,.]+)/i);
  return match ? match[0].trim() : 'Upcoming';
}

function generateDailySchedule(tasks) {
  const slots = [
    { time: '09:00 - 11:30', slotName: 'Peak Cognitive (Deep Work)' },
    { time: '11:45 - 12:30', slotName: 'High Focus Execution' },
    { time: '13:30 - 14:45', slotName: 'Collaborative & Meetings' },
    { time: '15:00 - 16:00', slotName: 'Operational & Quick Wins' },
    { time: '16:30 - 17:15', slotName: 'Daily Wrap-up & Review' },
  ];

  return tasks.slice(0, 5).map((task, index) => {
    const slot = slots[index] || { time: 'Later', slotName: 'Secondary Queue' };
    return {
      taskId: task.id,
      title: task.title,
      timeSlot: slot.time,
      blockType: slot.slotName,
      estimatedTime: task.estimatedTime,
      priority: task.priority,
    };
  });
}

function getSystemPrompt(mode = 'balanced') {
  return `You are UNMESS, an elite AI clarity engine. 
Your mission: Turn chaotic thoughts, fragmented notes, audio transcripts, or brain dumps into crystal-clear structured action units.
You MUST output valid, parseable JSON only. Do not include introductory text or commentary.

Output JSON structure:
{
  "cleanedProse": "A clean, beautiful, cohesive paragraph summarizing and clarifying the user's messy input",
  "chaosScore": 8.4,
  "tasks": [
    {
      "id": "task-1",
      "title": "Concise imperative action title",
      "description": "Clear context and details",
      "priority": "P1" | "P2" | "P3" | "P4",
      "urgencyScore": 9.2,
      "estimatedTime": "1.5 hrs",
      "category": "Work" | "Personal" | "Urgent" | "Operations",
      "deadline": "Thursday 4:00 PM"
    }
  ],
  "deadlines": [
    {
      "id": "dl-1",
      "title": "Associated task or event name",
      "deadlineText": "Date/time string"
    }
  ],
  "reminders": [
    {
      "id": "rem-1",
      "text": "Specific reminder or follow-up note",
      "priority": "P1" | "P2" | "P3"
    }
  ],
  "ideas": [
    {
      "id": "idea-1",
      "title": "Creative or speculative insight",
      "details": "Details",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "dailySchedule": [
    {
      "taskId": "task-1",
      "title": "Task title",
      "timeSlot": "09:00 - 11:30",
      "blockType": "Peak Cognitive (Deep Work)",
      "estimatedTime": "2h",
      "priority": "P1"
    }
  ]
}

Mode instruction:
${mode === 'aggressive' ? 'Extract maximum actionable tasks with zero fluff. Strict priority scoring.' : mode === 'executive' ? 'Focus heavily on executive synthesis and high-level deliverables.' : 'Balanced breakdown of tasks, deadlines, reminders, and polished prose.'}
Token economy rule: Be sharp, eliminate boilerplate, produce compact, high-value strings.`;
}

/**
 * Main dispatcher: cascades through available API keys
 */
export async function unmessEntropy(inputText, userKeys = {}, mode = 'balanced') {
  const startTime = performance.now();
  const trimmed = inputText.trim();

  if (!trimmed) {
    throw new Error('Please enter some chaotic text, notes, or thoughts to organize!');
  }

  // Priority cascade: Groq -> Gemini -> OpenRouter -> OpenAI -> Local Heuristic
  const cascade = [
    {
      name: 'Groq',
      key: userKeys.groq || import.meta.env.VITE_GROQ_API_KEY,
      fn: callGroq,
    },
    {
      name: 'Gemini',
      key: userKeys.gemini || import.meta.env.VITE_GEMINI_API_KEY,
      fn: callGemini,
    },
    {
      name: 'OpenRouter',
      key: userKeys.openrouter || import.meta.env.VITE_OPENROUTER_API_KEY,
      fn: callOpenRouter,
    },
    {
      name: 'OpenAI',
      key: userKeys.openai || import.meta.env.VITE_OPENAI_API_KEY,
      fn: callOpenAI,
    },
  ];

  const errors = [];

  for (const provider of cascade) {
    if (provider.key && provider.key.trim().length > 5) {
      try {
        console.log(`[UNMESS AI Router] Trying ${provider.name}...`);
        const resultData = await provider.fn(provider.key.trim(), trimmed, mode);
        const duration = Math.round(performance.now() - startTime);

        return {
          ...resultData,
          latencyMs: duration,
          failoverCount: errors.length,
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        console.warn(`[UNMESS AI Router] ${provider.name} failed:`, err.message);
        errors.push({ provider: provider.name, error: err.message });
      }
    }
  }

  // If no API keys provided or all providers failed, run the smart local NLP engine
  console.log('[UNMESS AI Router] Using intelligent local heuristic engine...');
  const localResult = runLocalSmartExtractor(trimmed, mode);
  const duration = Math.max(12, Math.round(performance.now() - startTime));

  return {
    ...localResult,
    latencyMs: duration,
    failoverCount: errors.length,
    timestamp: new Date().toISOString(),
    notice: errors.length > 0 
      ? `Active failover triggered (${errors.map(e => e.provider).join(' → ')}). Extracted using ${errors[errors.length - 1]?.provider || 'local engine'}.`
      : 'Processed using instant engine. Add API keys in Settings to unlock deep LLM models!',
  };
}
