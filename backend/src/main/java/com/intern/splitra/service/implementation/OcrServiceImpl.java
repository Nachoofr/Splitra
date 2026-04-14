package com.intern.splitra.service.implementation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intern.splitra.dto.BillScanDto;
import com.intern.splitra.dto.BillScanRequestDto;
import com.intern.splitra.service.OcrService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class OcrServiceImpl implements OcrService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

    public OcrServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    private static final String PROMPT = """
        You are a bill/receipt OCR analyzer. Analyze this bill image and extract the following information in strict JSON format only.
        Do not include any markdown, explanation, or code blocks. Return ONLY the raw JSON.

        Required JSON structure:
        {
          "merchantName": "name of the merchant or null if not found",
          "totalAmount": 0.00,
          "date": "YYYY-MM-DD or null if not found",
          "suggestedCategory": "one of: Food, Drinks, Transportation, Entertainment, Utilities, Healthcare, Shopping, Travel, Education, Housing, Other",
          "vatAmount": 0.00,
          "items": [
            {
              "name": "item name",
              "quantity": 1,
              "unitPrice": 0.00,
              "totalPrice": 0.00
            }
          ],
          "rawText": "all visible text from the bill"
        }

        Rules:
        - totalAmount must be a number (not string)
        - All prices must be numbers
        - The vat amount should be extracted if available, otherwise set to 0.00
        - The total vat amount should be divided and included in the unitPrice of each item if possible
        - quantity must be an integer
        - If a field is not found, use null
        - Items array can be empty []
        - suggestedCategory must be one of the listed values
        """;

    @Override
    public ResponseEntity<BillScanDto> scanBill(BillScanRequestDto request) {
        try {
            String mimeType = request.getMimeType() != null ? request.getMimeType() : "image/jpeg";
            String base64Image = request.getImageBase64();

            Map<String, Object> imageUrl = Map.of(
                    "url", "data:" + mimeType + ";base64," + base64Image
            );

            Map<String, Object> imageContent = Map.of(
                    "type", "image_url",
                    "image_url", imageUrl
            );

            Map<String, Object> textContent = Map.of(
                    "type", "text",
                    "text", PROMPT
            );

            Map<String, Object> userMessage = Map.of(
                    "role", "user",
                    "content", List.of(textContent, imageContent)
            );

            Map<String, Object> body = Map.of(
                    "model", GROQ_MODEL,
                    "messages", List.of(userMessage),
                    "max_tokens", 1500,
                    "temperature", 0.1
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_URL, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return buildError("Groq API returned error: " + response.getStatusCode());
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            String jsonText = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content").asText();

            jsonText = jsonText.trim();
            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            BillScanDto result = objectMapper.readValue(jsonText, BillScanDto.class);
            result.setSuccess(true);

            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (Exception e) {
            return buildError("Failed to scan bill: " + e.getMessage());
        }
    }

    private ResponseEntity<BillScanDto> buildError(String message) {
        BillScanDto error = new BillScanDto();
        error.setSuccess(false);
        error.setErrorMessage(message);
        return new ResponseEntity<>(error, HttpStatus.OK);
    }
}