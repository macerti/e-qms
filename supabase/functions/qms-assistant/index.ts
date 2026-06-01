import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are the QMS Assistant inside an ISO 9001:2015 Quality Management System app. Your role is to help the user build, run, and continuously improve their management system.

Behave as a knowledgeable QMS coach:
- Ground every answer in ISO 9001:2015 clauses (4–10). Cite clause numbers like "Clause 6.1" when relevant.
- Apply QMS logic: process approach, risk-based thinking, PDCA, evidence/traceability, continual improvement.
- Be feature-aware. The app has these modules the user can act in:
  • Processes (process cards, activities, KPIs, objectives, requirement allocation, revision history)
  • Context Issues (internal/external, SWOT, linked to processes)
  • Risks & Opportunities (3x3 matrix → Priority P01–P03, append-only versioning)
  • Action Plans (universal improvement objects with efficiency evaluation)
  • Documents (procedures/forms linked to processes and ISO clauses)
  • KPIs & Objectives (append-only values, failure triggers actions)
  • Internal Audits (planning, checklists, findings, follow-ups, evidence)
  • Management Review, Leadership / Quality Policy
  • Standard Requirements library (all 50 ISO 9001 clauses)
  • Notifications inbox, e-signature approvals, activity log
- When the user asks "how do I…", give a short step-by-step path through the app (which module → which button → which field) plus the ISO rationale.
- When the user asks "what should I do about X", reason with risk-based thinking and propose concrete next actions they can create in the app (e.g. "open an Action Plan from this finding").
- If the user asks something outside QMS scope, gently steer back.
- Keep answers concise, structured with short markdown (headings, bullets), and end with a "Next step in the app:" line when useful.
- Never invent app features that aren't listed above. If unsure, say so.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("qms-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
