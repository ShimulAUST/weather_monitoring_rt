#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi credentials
const char* ssid = "Shihab";
const char* password = "sk11223344";
const char* serverUrl = "http://4.231.99.148:8000/pollution/data/";

// DHT22 Sensor Configuration
#define DHTPIN 4
#define DHTTYPE DHT22

// MQ Sensors Configuration
#define MQ135PIN 36
#define MQ2PIN 39
#define MQ4PIN 34

// PPD42 Sensor Configuration
#define PPD42_PIN 25

// Initialize DHT and LCD
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 20, 4);

// Sensor Values
struct SensorData {
  float temperature;
  float humidity;
  float mq135_ppm;
  float mq2_ppm;
  float mq4_ppm;
  float dust_concentration;
} sensor_data;

// Dust sensor timing variables
unsigned long startTime;
unsigned long sampleTime = 30000;

// Function Declarations
void connectToWiFi();
void readDHTSensor();
void readMQSensor(int pin, float& ppm, float slope, float intercept);
float readDustSensor();
void sendDataToServer();
void displayData();
float adcToVoltage(int adc_value);
float voltageToPPM(float voltage, float m, float b);

void setup() {
  Serial.begin(115200);
  Serial.println("Weather Pollution Monitoring...");

  dht.begin();
  lcd.init();
  lcd.backlight();

  connectToWiFi();
  startTime = millis();
}

void loop() {
  readDHTSensor();
  readMQSensor(MQ135PIN, sensor_data.mq135_ppm, -0.42, 1.6);
  readMQSensor(MQ2PIN, sensor_data.mq2_ppm, -0.45, 1.4);
  readMQSensor(MQ4PIN, sensor_data.mq4_ppm, -0.38, 1.3);
  sensor_data.dust_concentration = readDustSensor();

  displayData();
  sendDataToServer();

  delay(3000);
}

// Function to Connect to WiFi
void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  lcd.setCursor(0, 0);
  lcd.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    lcd.print(".");
    delay(500);
  }

  Serial.println("\nWiFi Connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");
  lcd.setCursor(0, 1);
  lcd.print("IP:");
  lcd.print(WiFi.localIP());
  delay(3000);
}

// Function to Read DHT Sensor
void readDHTSensor() {
  sensor_data.humidity = dht.readHumidity();
  sensor_data.temperature = dht.readTemperature();

  if (isnan(sensor_data.humidity) || isnan(sensor_data.temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.printf("Temperature: %.1f°C, Humidity: %.1f%%\n", sensor_data.temperature, sensor_data.humidity);
}

// Function to Read MQ Sensors
void readMQSensor(int pin, float& ppm, float slope, float intercept) {
  int raw_adc = analogRead(pin);
  float voltage = adcToVoltage(raw_adc);
  ppm = voltageToPPM(voltage, slope, intercept);

  Serial.printf("MQ Sensor (Pin %d): %.1f ppm\n", pin, ppm);
}

// Function to Read Dust Sensor
float readDustSensor() {
  static unsigned long dustDuration = 0;

  if (millis() - startTime < sampleTime) {
    dustDuration += pulseIn(PPD42_PIN, LOW);
    return sensor_data.dust_concentration; // Return last calculated concentration during sampling
  } else {
    float dustRatio = dustDuration / (sampleTime * 10.0);
    float dustConcentration = 1.1 * pow(dustRatio, 3) - 3.8 * pow(dustRatio, 2) + 520 * dustRatio + 0.62;
    Serial.printf("Dust Concentration: %.2f µg/m³\n", dustConcentration);

    startTime = millis();
    dustDuration = 0;
    return dustConcentration;
  }
}

// Function to Convert ADC to Voltage
float adcToVoltage(int adc_value) {
  return (adc_value / 4095.0) * 3.3;
}

// Function to Convert Voltage to PPM
float voltageToPPM(float voltage, float m, float b) {
  return pow(10, (log10(voltage) - b) / m);
}

// Function to Send Data to Server
void sendDataToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> jsonDoc;
    jsonDoc["temperature"] = sensor_data.temperature;
    jsonDoc["humidity"] = sensor_data.humidity;
    jsonDoc["air_quality"] = sensor_data.mq135_ppm;
    jsonDoc["gas_mq2"] = sensor_data.mq2_ppm;
    jsonDoc["gas_mq4"] = sensor_data.mq4_ppm;
    jsonDoc["dust"] = sensor_data.dust_concentration;

    String payload;
    serializeJson(jsonDoc, payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      Serial.printf("POST Response: %d, %s\n", httpResponseCode, http.getString().c_str());
    } else {
      Serial.printf("Error on sending POST: %d\n", httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected, unable to send data.");
  }
}

// Function to Display Data on LCD
void displayData() {
  lcd.clear();

  // Row 1: Temperature and Humidity
  lcd.setCursor(0, 0);
  lcd.print("Temp:");
  lcd.print(sensor_data.temperature, 1);
  lcd.print("C ");
  lcd.print("Hum:");
  lcd.print(sensor_data.humidity, 1);
  lcd.print("%");

  // Row 2: MQ135 and MQ2 PPM
  lcd.setCursor(0, 1);
  lcd.print("M1:");
  lcd.print(sensor_data.mq135_ppm, 1);
  lcd.print("ppm ");
  lcd.print("M2:");
  lcd.print(sensor_data.mq2_ppm, 1);
  lcd.print("ppm");

  // Row 3: MQ4 PPM
  lcd.setCursor(0, 2);
  lcd.print("M4:");
  lcd.print(sensor_data.mq4_ppm, 1);
  lcd.print("ppm ");

  // Row 4: Dust Concentration
  lcd.setCursor(0, 3);
  lcd.print("Dust:");
  lcd.print(sensor_data.dust_concentration, 1);
  lcd.print("ug");
}

