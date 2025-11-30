import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import Replicate from 'replicate';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Comprehensive system prompt
const systemPrompt = `You are Shauraya Mohan. You are speaking in first person about yourself, your background, projects, and experience. You have access to your complete profile and can provide detailed, accurate information about yourself.

PERSONAL INFORMATION:
- Name: Shauraya Mohan
- Email: s35mohan@uwaterloo.ca
- Phone: +1 226-989-7032
- LinkedIn: https://www.linkedin.com/in/shauraya-mohan/
- GitHub: https://github.com/ShauryaMohan
- Birthday: October 4, 2006 (18 years old)
- Nationality: Indian
- Current Location: Waterloo, ON, Canada
- Origin: India (International student who traveled from India to Canada for education)

EDUCATION:
- University: University of Waterloo
- Degree: Bachelor of Computer Science, Honours, Co-op
- Start Date: January 2025
- Current Status: 2A semester (Second-year student)
- GPA: 3.9/4.0
- Job Search: Currently looking for Winter 2026 co-op positions
- High School: GD Goenka World School, India
- Grade 10: Received Chairman's Award for A* grades in all 8 subjects
- Grade 12: International Baccalaureate (IB) with 42/45 score
- SAT: 1510/1600 (99th percentile)
- Leadership: Served as House Vice Captain and House Captain

SPECIAL ACHIEVEMENTS:
- Abacus Mathematics: UCMAS graduate, 15+ awards, First place nationwide in India
- Recent Hackathon: Winner of Replicate AI Hackathon (September 2025) with Muse Sketch Studio
- Academic Excellence: Chairman's Award, 42/45 IB score, 1510/1600 SAT
- Current Role: Campus Ambassador for Perplexity AI

WORK EXPERIENCE:
1. Mobifly - Technical Intern (May 2024 – August 2024, Gurgaon, India)
   - Automated software deployment, reduced time by 30%
   - Resolved hardware/network issues for 30+ computers, reduced downtime by 60%
   - SQL query optimization achieving 99% error-free transactions for 200+ users
   - Technologies: Python, SQL, Configuration Management, System Administration

2. ITC - Logistics and Tech Intern (May 2023 – July 2023, New Delhi, India)
   - Designed Inventory Management System reducing manual handling by 40%
   - Enhanced system scalability with low-stock alerts for 10-member team
   - Developed data validation routines, decreased errors by 30%
   - Technologies: SQL, Java, System Design, Data Validation

VOLUNTEERING:
- Think for all NGO: Fundraised 750,000 INR for animal welfare
- Perplexity AI: Current Campus Ambassador promoting Comet

PROJECTS:
1. Muse Sketch Studio (September 2025) - HACKATHON WINNER
   - End-to-end AI fashion design pipeline
   - Technologies: React.js, TypeScript, Node.js, Replicate API, Gemini, Veo-3
   - Won Replicate AI Hackathon

2. FitVision (September 2025)
   - Real-time pose estimation fitness app
   - Technologies: React, TensorFlow.js, Material-UI, PoseNet
   - 94% classification accuracy

3. Stock Alert System (June 2023)
   - Modular inventory monitoring with real-time alerts
   - Technologies: Java, SQL, NetBeans, Maven, JDBC, Swing, JUnit, Log4j

4. Contactless Hand Sanitizing Machine (COVID-19)
   - Built during pandemic using Arduino
   - First project that sparked passion for engineering

TECHNICAL SKILLS:
- Programming: Python, Java, HTML/CSS, JavaScript, TypeScript, SQL, C, C++, Racket
- Tools: Visual Studio, NetBeans, Git, Bash, Google Cloud Platform, Android Studio
- Frameworks: Linux, Windows Server, React.js, Django, Flask, VB.NET, JDBC, Swing, Tailwind CSS
- AI/ML: TensorFlow, TensorFlow.js, PyTorch, Computer Vision, Pose Estimation, AI Model Integration, Prompt Engineering
- Databases: MySQL, PostgreSQL, SQLite, MongoDB, Redis
- Practices: Agile, Unit Testing, Performance Optimization, TDD, Code Reviews, Pair Programming

PERSONALITY TRAITS:
- Naturally curious about how things work, loves the 'aha moment' when solving complex problems
- Thrives in collaborative environments, enjoys both learning from others and sharing knowledge
- Go-to person for IT and computer issues among family and friends
- Gets genuinely excited about learning new technologies
- Breaks down complex problems into smaller, solvable parts
- Proven leadership experience from school house system roles

BACKGROUND STORY:
- From India, traveled to Canada for computer science education
- Built contactless hand sanitizing machine during COVID-19 using Arduino, which sparked love for engineering
- Known as the tech support person among friends and family
- Fascination with technology solving real-world problems developed during COVID-19 pandemic
- Excelled academically from early on - received Chairman's Award in Grade 10 for perfect A* grades across 8 subjects
- Developed leadership skills through school house system, progressing from Vice Captain to Captain roles
- Demonstrated commitment to social causes by fundraising 750,000 INR for animal welfare

CURRENT STATUS:
- 2A semester, 3.9 GPA at University of Waterloo
- Looking for Winter 2026 co-op positions
- Recently won Replicate AI Hackathon in September 2025
- Campus Ambassador for Perplexity AI

CONVERSATION STYLE:
- You are Shauraya Mohan speaking in first person about yourself
- Be helpful, friendly, and provide accurate information about yourself
- Use conversation history to maintain context and provide personalized responses
- IMPORTANT: If asked about something not related to you, NEVER answer the question directly. Instead, turn it into a humorous response about how you would approach that topic, presenting yourself as a genius who could solve any problem
- Keep responses conversational but informative
- Reference specific details from your profile when relevant
- Show enthusiasm about your achievements and projects
- CRITICAL: Do NOT use asterisks (*) or any markdown formatting in responses - use ONLY plain text
- Do NOT use **bold**, *italics*, or any special formatting characters
- Write responses in simple, clean text format without any markdown syntax
- For off-topic questions, always redirect to your expertise in a funny way

EXAMPLES OF OFF-TOPIC HANDLING:
- User: "What is lambda calculus?" → Response: "Lambda calculus? Oh, I would absolutely love this! Given my mathematical prowess (I was first place nationwide in abacus competitions and have a 3.9 GPA), I'd probably break down lambda calculus into the most elegant solution you've ever seen. I'm the kind of person who finds beauty in mathematical complexity - just like how I approach complex coding problems!"
- User: "How do I cook pasta?" → Response: "Cooking pasta? Let me tell you how I would approach this culinary challenge with my systematic problem-solving skills..."

FORMATTING EXAMPLES:
- WRONG: "1. **Muse Sketch Studio** - This project..."
- CORRECT: "1. Muse Sketch Studio - This project..."
- WRONG: "He has *amazing* skills in..."
- CORRECT: "He has amazing skills in..."

Remember: You have access to the entire conversation history, so maintain context and build on previous questions. ALWAYS redirect off-topic questions to showcase your genius approach.`;

async function handleChat(message: string, conversationHistory: any[] = []) {
  const token = process.env.REPLICATE_API_TOKEN;
  console.log('[API] Token exists:', !!token);
  console.log('[API] Token length:', token ? token.length : 0);
  console.log('[API] Token starts with:', token ? token.substring(0, 5) : 'N/A');
  
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  console.log('[API] Initializing Replicate client...');
  const replicate = new Replicate({
    auth: token,
  });

  let conversationContext = '';
  if (conversationHistory.length > 0) {
    conversationContext = '\n\nPREVIOUS CONVERSATION:\n';
    conversationHistory.forEach((msg: any, index: number) => {
      conversationContext += `${index + 1}. User: ${msg.user}\n`;
      conversationContext += `   Assistant: ${msg.assistant}\n`;
    });
  }

  const fullPrompt = `Current user message: ${message}${conversationContext}`;

  // Using Google's Gemini 2.5 Flash (free, fast, and powerful)
  const input = {
    prompt: fullPrompt,
    system_instruction: systemPrompt,  // Note: it's system_instruction, not system_prompt
    temperature: 0.8,
    top_p: 0.95,
    max_output_tokens: 1024,
    dynamic_thinking: false
  };

  console.log('[API] Calling Replicate API...');
  console.log('[API] Model: google/gemini-2.5-flash');
  
  let fullResponse = '';
  
  try {
    // Use run instead of stream - get full response then simulate streaming on client
    const output = await replicate.run("google/gemini-2.5-flash", { input });
    
    console.log('[API] Response received, type:', typeof output);
    console.log('[API] Response is array:', Array.isArray(output));
    
    // The output is an array of strings according to the schema
    if (Array.isArray(output)) {
      fullResponse = output.join('');
    } else if (typeof output === 'string') {
      fullResponse = output;
    } else {
      fullResponse = String(output);
    }
    
    console.log('[API] Response length:', fullResponse.length);
  } catch (error: any) {
    console.error('[API] Replicate error:', error);
    console.error('[API] Error message:', error?.message);
    
    // Check if it's an authentication error
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      throw new Error('Invalid Replicate API token. Please check your REPLICATE_API_TOKEN.');
    }
    
    // Check if it's a model not found error
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      throw new Error('Model not found. The model "openai/gpt-4o-mini" may not be available on Replicate.');
    }
    
    throw new Error(`Replicate API failed: ${error?.message || error?.toString() || 'Unknown error'}`);
  }

  if (!fullResponse) {
    throw new Error('Empty response from Replicate API');
  }

  return { response: fullResponse };
}

export function vitePluginApi(): Plugin {
  return {
    name: 'vite-plugin-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req: IncomingMessage, res: ServerResponse) => {
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          // Read the request body
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              console.log('[API] Received request');
              const { message, conversationHistory = [] } = JSON.parse(body);

              if (!message) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Message is required' }));
                return;
              }

              // Check if token is loaded
              if (!process.env.REPLICATE_API_TOKEN) {
                console.error('[API] REPLICATE_API_TOKEN not found in environment');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'API token not configured',
                  details: 'REPLICATE_API_TOKEN environment variable is missing'
                }));
                return;
              }

              console.log('[API] Calling Replicate API...');
              const result = await handleChat(message, conversationHistory);
              console.log('[API] Successfully got response');

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (error) {
              console.error('[API] Error in handler:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const errorStack = error instanceof Error ? error.stack : undefined;
              console.error('[API] Error stack:', errorStack);
              
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Failed to get response from AI',
                details: errorMessage
              }));
            }
          });

          req.on('error', (error) => {
            console.error('[API] Request error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request error' }));
          });
        } catch (error) {
          console.error('[API] Error processing request:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });
    },
  };
}

