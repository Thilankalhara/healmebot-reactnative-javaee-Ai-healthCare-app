package controller;
import java.io.*;
import java.net.*;


// THIS SERVLET FOR CHECK YOUR API KEY
public class Main {
    // Using v1 API with Gemini 2.5 Flash (newest available model)
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
    private static final String LIST_MODELS_URL = "https://generativelanguage.googleapis.com/v1/models";
    
    public static void main(String[] args) {
        // === PROXY SETTINGS ===
        String proxyHost = ""; //YOUR PROXY
        int proxyPort = ; //YOUR PORT
        
        // === YOUR GEMINI API KEY ===
        String apiKey = "YOUR API KEY";
        
        try {
            // First, list available models
            System.out.println("=== Listing Available Models ===");
            listModels(apiKey, proxyHost, proxyPort);
            
            System.out.println("\n=== Attempting Chat ===");
            String reply = chatGemini("hello", apiKey, proxyHost, proxyPort);
            System.out.println("Gemini: " + reply);
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static void listModels(String apiKey, String proxyHost, int proxyPort) throws IOException {
        URL url = new URL(LIST_MODELS_URL + "?key=" + apiKey);
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(proxyHost, proxyPort));
        HttpURLConnection con = (HttpURLConnection) url.openConnection(proxy);
        
        con.setConnectTimeout(30000);
        con.setReadTimeout(60000);
        con.setRequestMethod("GET");
        
        int code = con.getResponseCode();
        System.out.println("List Models Response Code: " + code);
        
        InputStream stream = (code >= 200 && code < 300) ? con.getInputStream() : con.getErrorStream();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, "UTF-8"))) {
            String line;
            while ((line = br.readLine()) != null) {
                // Print model names only
                if (line.contains("\"name\":")) {
                    System.out.println(line.trim());
                }
            }
        }
    }
    
    public static String chatGemini(String message, String apiKey, String proxyHost, int proxyPort) throws IOException {
        URL url = new URL(API_URL + "?key=" + apiKey);
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(proxyHost, proxyPort));
        HttpURLConnection con = (HttpURLConnection) url.openConnection(proxy);
        
        con.setConnectTimeout(30000);
        con.setReadTimeout(60000);
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/json");
        
        String payload = "{\"contents\":[{\"parts\":[{\"text\":" + jsonQuote(message) + "}]}]}";
        System.out.println("Sending via proxy " + proxyHost + ":" + proxyPort + ": " + payload);
        
        con.setDoOutput(true);
        try (OutputStream os = con.getOutputStream()) {
            os.write(payload.getBytes("UTF-8"));
            os.flush();
        }
        
        int code = con.getResponseCode();
        System.out.println("HTTP Response Code: " + code);
        
        InputStream stream = (code >= 200 && code < 300) ? con.getInputStream() : con.getErrorStream();
        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, "UTF-8"))) {
            String line;
            while ((line = br.readLine()) != null) response.append(line);
        }
        
        System.out.println("Full Response: " + response);
        
        if (code != 200) {
            throw new IOException("Gemini error: " + response);
        }
        
        return extractGeminiContent(response.toString());
    }
    
    private static String extractGeminiContent(String json) {
        String key = "\"text\":\"";
        int start = json.indexOf(key);
        if (start == -1) return "[Parse error: no content]";
        
        start += key.length();
        int end = start;
        while (end < json.length()) {
            char c = json.charAt(end);
            if (c == '"' && (end == 0 || json.charAt(end - 1) != '\\')) break;
            end++;
        }
        
        return json.substring(start, end)
            .replace("\\n", "\n")
            .replace("\\\"", "\"")
            .replace("\\\\", "\\")
            .trim();
    }
    
    private static String jsonQuote(String s) {
        if (s == null) return "\"\"";
        StringBuilder sb = new StringBuilder();
        sb.append('"');
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default: 
                    if (c < 32) sb.append(String.format("\\u%04x", (int)c)); 
                    else sb.append(c);
            }
        }
        sb.append('"');
        return sb.toString();
    }
}