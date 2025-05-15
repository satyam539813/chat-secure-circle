
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { message, imageUrl } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("Missing Gemini API key");
    }

    // Prepare the request body for Gemini API
    const requestBody: any = {
      contents: [
        {
          parts: [
            { text: message || "Hello" }
          ]
        }
      ]
    };

    // Add image to request if provided
    if (imageUrl) {
      // For images, we need to get the image data from Supabase storage
      // Parse Authorization header
      const authHeader = req.headers.get("Authorization")?.split("Bearer ")[1];
      if (!authHeader) {
        throw new Error("Missing Authorization header");
      }

      // Create Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const supabase = createClient(supabaseUrl!, supabaseKey!);

      // Get the image from storage
      const { data, error } = await supabase.storage
        .from("chat_images")
        .download(imageUrl.replace("chat_images/", ""));

      if (error) {
        throw new Error(`Error fetching image: ${error.message}`);
      }

      // Convert to base64
      const imageBase64 = await data.arrayBuffer()
        .then(buffer => btoa(String.fromCharCode(...new Uint8Array(buffer))));

      // Add image to request
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg", // Adjust based on actual image type if needed
          data: imageBase64
        }
      });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let aiResponse = "";

    // Extract text from Gemini response
    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0]?.content;
      if (content && content.parts && content.parts.length > 0) {
        aiResponse = content.parts.map(part => part.text).join(" ");
      }
    }

    // Return the AI response
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
