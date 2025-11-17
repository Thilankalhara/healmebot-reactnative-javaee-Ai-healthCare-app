package controller;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import com.google.gson.*;

@WebServlet("/GenerateSuggestions")
public class GenerateSuggestionsServlet extends HttpServlet {

    //  Use valid Gemini model
    private static final String GEMINI_API_URL =
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

    
    private static final String GEMINI_API_KEY = "YOUR GEMINI API KEY";

    //  Optional proxy settings
    private static final String PROXY_HOST = ""; //YOUR PROXY
    private static final int PROXY_PORT = 0; // YOUR PORT
    private static final boolean USE_PROXY = true;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("=== GenerateSuggestions called ===");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Read incoming JSON
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
            }

            JsonObject input = JsonParser.parseString(sb.toString()).getAsJsonObject();

            //  Get all fields safely
            String name = input.has("name") ? input.get("name").getAsString() : "User";
            int age = input.has("age") ? input.get("age").getAsInt() : 0;
            int height = input.has("height") ? input.get("height").getAsInt() : 0;
            int weight = input.has("weight") ? input.get("weight").getAsInt() : 0;
            String healthIssues = input.has("healthIssues") ? input.get("healthIssues").getAsString() : "None";

            System.out.println("User Data - Name: " + name + ", Age: " + age + ", Height: " + height + ", Weight: " + weight);

            //  Improved prompt (includes user name)
            String prompt = String.format(
                "You are a professional health assistant. Based on the following user details, " +
                "generate personalized breakfast, lunch, and dinner suggestions and provide 5 short health tips.\n\n" +
                "Name: %s\nAge: %d\nHeight: %d cm\nWeight: %d kg\nHealth Issues: %s\n\n" +
                "Please format your response clearly with headings for each meal and bullet points for tips.",
                name, age, height, weight, healthIssues
            );

            String suggestions = callGeminiWithRetry(prompt);

            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("ok", true);
            jsonResponse.addProperty("name", name);
            jsonResponse.addProperty("suggestions", suggestions);

            response.getWriter().write(jsonResponse.toString());

            System.out.println(" Suggestions generated successfully for " + name);

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("ok", false);
            error.addProperty("message", "Error: " + e.getMessage());
            response.getWriter().write(error.toString());
        }
    }

    // === Retry logic for API timeouts / rate limits ===
    private String callGeminiWithRetry(String prompt) throws IOException, InterruptedException {
        int attempts = 0;
        int maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                return callGemini(prompt);
            } catch (SocketTimeoutException | SocketException e) {
                attempts++;
                if (attempts >= maxAttempts) throw e;
                System.out.println("⚠️ Retry " + attempts + " due to network error: " + e.getMessage());
                Thread.sleep(3000L * attempts);
            } catch (IOException e) {
                if (e.getMessage().contains("429") || e.getMessage().contains("503")) {
                    attempts++;
                    if (attempts >= maxAttempts) throw e;
                    System.out.println("⚠️ API busy, retrying... Attempt " + attempts);
                    Thread.sleep(5000);
                } else throw e;
            }
        }
        throw new IOException("Failed after " + maxAttempts + " attempts");
    }

    // === Main Gemini API call ===
    private String callGemini(String prompt) throws IOException {
        HttpURLConnection conn;
        URL url = new URL(GEMINI_API_URL + "?key=" + GEMINI_API_KEY);

        if (USE_PROXY) {
            Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(PROXY_HOST, PROXY_PORT));
            conn = (HttpURLConnection) url.openConnection(proxy);
            System.out.println("Connecting to Gemini via proxy " + PROXY_HOST + ":" + PROXY_PORT);
        } else {
            conn = (HttpURLConnection) url.openConnection();
            System.out.println("Connecting to Gemini directly");
        }

        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(60000);

        // Prepare JSON payload
        JsonObject body = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonObject content = new JsonObject();
        JsonArray parts = new JsonArray();
        JsonObject part = new JsonObject();
        part.addProperty("text", prompt);
        parts.add(part);
        content.add("parts", parts);
        contents.add(content);
        body.add("contents", contents);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.toString().getBytes(StandardCharsets.UTF_8));
        }

        int status = conn.getResponseCode();
        InputStream is = (status >= 200 && status < 300) ? conn.getInputStream() : conn.getErrorStream();

        if (is == null) throw new IOException("No response from Gemini (status: " + status + ")");

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
        }

        String responseStr = sb.toString();
        System.out.println("Full Response: " + responseStr.substring(0, Math.min(300, responseStr.length())) + "...");

        if (status != 200)
            throw new IOException("Gemini error (HTTP " + status + "): " + responseStr);

        return extractGeminiContent(responseStr);
    }

    // === Extract AI text from JSON ===
    private String extractGeminiContent(String json) {
        try {
            JsonObject obj = JsonParser.parseString(json).getAsJsonObject();
            JsonArray candidates = obj.getAsJsonArray("candidates");
            if (candidates != null && candidates.size() > 0) {
                JsonObject firstCandidate = candidates.get(0).getAsJsonObject();
                JsonObject content = firstCandidate.getAsJsonObject("content");
                JsonArray parts = content.getAsJsonArray("parts");
                if (parts != null && parts.size() > 0)
                    return parts.get(0).getAsJsonObject().get("text").getAsString();
            }
        } catch (Exception e) {
            System.err.println("JSON parse failed: " + e.getMessage());
        }
        return "[No content received]";
    }
}
