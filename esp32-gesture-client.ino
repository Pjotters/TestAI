#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Base64.h>

// WiFi credentials
const char* ssid = "jouw_wifi_naam";
const char* password = "jouw_wifi_wachtwoord";

// API endpoint
const char* apiEndpoint = "https://jouw-vercel-url/api/ar-gesture";

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        // Neem foto met camera
        String base64Image = captureAndEncodeImage();
        
        // Maak API request
        HTTPClient http;
        http.begin(apiEndpoint);
        http.addHeader("Content-Type", "application/json");
        
        // Bereid JSON data voor
        StaticJsonDocument<2048> doc;
        doc["image"] = base64Image;
        
        String jsonString;
        serializeJson(doc, jsonString);
        
        // Stuur request
        int httpCode = http.POST(jsonString);
        
        if (httpCode > 0) {
            String response = http.getString();
            
            // Parse response
            StaticJsonDocument<200> responseDoc;
            deserializeJson(responseDoc, response);
            
            // Gebruik het gebaar in je AR-bril
            const char* gesture = responseDoc["gesture"];
            float confidence = responseDoc["confidence"];
            
            // Doe iets met het gebaar
            handleGesture(gesture, confidence);
        }
        
        http.end();
    }
    
    delay(100); // 10 FPS voor real-time detectie
}

void handleGesture(const char* gesture, float confidence) {
    if (confidence > 0.8) { // Alleen hoge confidence gebaren
        if (strcmp(gesture, "vuist") == 0) {
            // Toon vuist actie in AR
        } else if (strcmp(gesture, "duim_omhoog") == 0) {
            // Toon duim omhoog in AR
        } else {
            // Toon aantal vingers in AR
            int fingers = atoi(gesture);
            if (fingers > 0) {
                // Toon aantal vingers
            }
        }
    }
} 