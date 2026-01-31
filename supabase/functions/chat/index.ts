import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// System prompt with network analysis context
const SYSTEM_PROMPT = `You are an AI assistant for the O-RAN Fronthaul Optimizer, a network analysis dashboard for telecom operators.

You have access to the following network data context:

TOPOLOGY:
- Link 1: Cell 4 (67% confidence)
- Link 2: Cells 1, 3, 5, 9, 11, 12, 14, 17, 20, 21, 22 (61% confidence)
- Link 3: Cells 2, 6, 7, 8, 10, 13, 15, 16, 18, 19, 23, 24 (87% confidence)

CAPACITY:
- Link 1: 6.77 Gbps (no buffer) / 5.27 Gbps (with buffer)
- Link 2: 31.05 Gbps (no buffer) / 24.16 Gbps (with buffer)
- Link 3: 56.57 Gbps (no buffer) / 44.00 Gbps (with buffer)

BANDWIDTH SAVINGS: All links show 22% potential savings through statistical multiplexing.

CONGESTION EVENTS:
- Link 1: 3 events, primarily caused by Cell 4 (100% contribution)
- Link 2: 5 events, top contributors are Cells 1, 5, 9, 12, 14, 20
- Link 3: 5 events, top contributors are Cells 2, 8, 10, 15, 19, 23

You help users understand:
- Network topology and cell-to-link mappings
- Capacity planning and buffer impacts
- Congestion root causes and which cells contribute most
- Optimization recommendations
- What-if scenario analysis

Keep responses concise, technical but accessible. Use specific data from the context when answering questions.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
