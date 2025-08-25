#include <Adafruit_LiquidCrystal.h>

// LCD (I2C address = 0)
Adafruit_LiquidCrystal lcd_1(0);

// Sensor pins
const int gasPin = A0;   // MQ gas sensor
const int ldrPin = A1;   // Photoresistor
const int tempPin = A2;  // LM35 temperature sensor

const int gasThreshold = 400;   // arbitrary ppm value
const int lightThreshold = 300; // arbitrary brightness

void setup() {
  // LCD setup
  lcd_1.begin(16, 2);
  lcd_1.setBacklight(1);

  // Serial setup
  Serial.begin(9600);
  while (!Serial) { } // wait for serial (for boards like Leonardo)

  lcd_1.print("CarbonX Monitor");
  Serial.println("CarbonX Monitor");
  delay(2000);
  lcd_1.clear();
}

void loop() {
  // === Read Gas Sensor ===
  int gasValue = analogRead(gasPin);

  // === Read Light ===
  int lightValue = analogRead(ldrPin);

  // === Read Temp (LM35) ===
  int tempRaw = analogRead(tempPin);
  float voltage = tempRaw * (5.0 / 1023.0);
  float temperatureC = voltage * 100.0;

  // === Interpret Air Quality ===
  String airQuality;
  if (gasValue < gasThreshold) {
    airQuality = "Good ";
  } else {
    airQuality = "Bad! ";
  }

  // === Interpret Light ===
  String lightStatus;
  if (lightValue < lightThreshold) {
    lightStatus = "Dark";
  } else {
    lightStatus = "Bright";
  }

  // === Display on LCD ===
  lcd_1.clear();
  lcd_1.setCursor(0,0);
  lcd_1.print("G:");
  lcd_1.print(gasValue);
  lcd_1.print(" ");
  lcd_1.print(lightStatus);

  lcd_1.setCursor(0,1);
  lcd_1.print("T:");
  lcd_1.print(temperatureC,1);
  lcd_1.print("C ");
  lcd_1.print(airQuality);

  // === Print to Serial Monitor ===
  Serial.print("Gas: ");
  Serial.print(gasValue);
  Serial.print(" | Light: ");
  Serial.print(lightValue);
  Serial.print(" (");
  Serial.print(lightStatus);
  Serial.print(") | Temp: ");
  Serial.print(temperatureC,1);
  Serial.print(" C | Air Quality: ");
  Serial.println(airQuality);

  delay(1500);
}
