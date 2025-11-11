#!/bin/bash

# Download all training files from GenSpark uploads

FILES=(
  "296dbf79-b211-42da-896a-6d4b13ab57de:الفهرس_الرئيسي_الشامل.md"
  "2e690d65-869c-4a28-bda6-40bd6f2daa01:SAP2000_Tank_Analysis_Script.py"
  "87cec93b-f618-47b3-aa3e-638cbad9b146:خطة_عمل_YQArch.md"
  "bf009647-4f09-4dde-a569-5ff9ed71c6bb:دليل_تدريبي_شامل.md"
  "dfae33c6-62dc-4438-8933-40ffb7181327:دليل_نظام_الخزانات.md"
  "5506042b-8112-49d9-b852-9cb101f476e6:ما_تعلمته_YQArch.md"
  "2378d027-4baa-456b-90b8-50676a48e3a2:دليل_الرياح_والزلازل.md"
  "fbe1ee4a-771b-40d1-810d-feaa4a09fc32:توثيق_مخططات_AutoCAD.md"
  "6924c7d6-cab5-4bc0-8b93-c3e6409fd4ce:دليل_سكريبت_LISP.md"
  "c5e07c02-6078-46d8-83ce-d51d8b4e2c6e:دليل_التطبيق_الكامل.md"
  "c9246eda-692b-4e50-874a-2a23d84fa1d7:دليل_الحظائر_الحيوانية.md"
)

BASE_URL="https://page.gensparksite.com/get_upload_url/04bafb5cd8419d42a62a22ddf19d75c04780fbc5b0c5316553cff4f5446af111/default"

for file_info in "${FILES[@]}"; do
  ID="${file_info%%:*}"
  NAME="${file_info##*:}"
  echo "Downloading: $NAME"
  curl -L -o "$NAME" "$BASE_URL/$ID" 2>/dev/null || echo "Failed: $NAME"
done

echo "Download complete!"
