#!/bin/bash
# Generate 12 monthly covers via fal.ai Flux Pro
API_KEY="0dde85d0-affb-4c7e-9142-afa4302b812e:faebde71a8a22cf105e1b29c72b68515"
OUT_DIR="/Users/yaroslavbalakin/Desktop/Projects/Bullet Journal/app/images/covers"

MONTHS=("january" "february" "march" "april" "may" "june" "july" "august" "september" "october" "november" "december")

PROMPTS=(
  "Cozy cottagecore watercolor illustration of a winter January scene: a frosted window with warm candlelight inside, snow-covered pine branches, soft pink and cream tones, delicate botanical details, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of February: Valentine hearts made of dried flowers, vintage love letters, soft lavender and rose tones, lace doily details, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of March spring awakening: first snowdrops and crocuses breaking through snow, pussy willow branches, soft green and cream tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of April: cherry blossom branches with rain drops, a small bird on a branch, warm peach and pink tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of May: a lush flower garden with peonies and lily of the valley, a butterfly, fresh green and white tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of June: a field of wildflowers and poppies, a straw hat with ribbon, warm pink and golden tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of July summer: a meadow with lavender and daisies, a glass of lemonade, warm green and yellow tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of August: golden wheat field at sunset, sunflowers, ripe berries in a basket, warm amber and peach tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of September: golden autumn leaves falling, a cozy knit scarf, hot tea in a ceramic mug, warm amber and brown tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of October: pumpkins and autumn foliage, mushrooms, a cozy cabin, warm orange and brown tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of November: misty morning with bare trees, a stack of old books with a candle, muted lavender and grey tones, journal cover art style, dreamy and whimsical, no text"
  "Cozy cottagecore watercolor illustration of December: a decorated Christmas wreath with berries and pinecones, warm fairy lights, soft blue and cream tones, journal cover art style, dreamy and whimsical, no text"
)

echo "Submitting 12 cover generation requests..."

# Submit all requests
declare -a REQUEST_IDS
for i in {0..11}; do
  MONTH="${MONTHS[$i]}"
  PROMPT="${PROMPTS[$i]}"

  RESPONSE=$(curl -s -X POST "https://queue.fal.run/fal-ai/flux-pro/v1.1" \
    -H "Authorization: Key $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"$PROMPT\", \"image_size\": {\"width\": 768, \"height\": 1024}, \"num_images\": 1, \"safety_tolerance\": \"5\"}")

  REQ_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('request_id',''))" 2>/dev/null)

  if [ -n "$REQ_ID" ]; then
    REQUEST_IDS[$i]="$REQ_ID"
    echo "  [$MONTH] submitted: $REQ_ID"
  else
    echo "  [$MONTH] FAILED: $RESPONSE"
    REQUEST_IDS[$i]=""
  fi
done

echo ""
echo "Waiting for results..."

# Poll and download
for i in {0..11}; do
  MONTH="${MONTHS[$i]}"
  REQ_ID="${REQUEST_IDS[$i]}"

  if [ -z "$REQ_ID" ]; then
    echo "  [$MONTH] skipped (no request_id)"
    continue
  fi

  # Poll status
  for attempt in {1..60}; do
    STATUS=$(curl -s "https://queue.fal.run/fal-ai/flux-pro/requests/$REQ_ID/status" \
      -H "Authorization: Key $API_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)

    if [ "$STATUS" = "COMPLETED" ]; then
      break
    elif [ "$STATUS" = "FAILED" ]; then
      echo "  [$MONTH] generation FAILED"
      continue 2
    fi
    sleep 3
  done

  # Download result
  RESULT=$(curl -s "https://queue.fal.run/fal-ai/flux-pro/requests/$REQ_ID" \
    -H "Authorization: Key $API_KEY")

  IMG_URL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['images'][0]['url'])" 2>/dev/null)

  if [ -n "$IMG_URL" ]; then
    FILENAME=$(printf "%02d-%s.jpg" $((i+1)) "$MONTH")
    curl -s -o "$OUT_DIR/$FILENAME" "$IMG_URL"
    echo "  [$MONTH] saved: $FILENAME"
  else
    echo "  [$MONTH] no image URL in result"
  fi
done

echo ""
echo "Done! Check $OUT_DIR"
ls -la "$OUT_DIR"
