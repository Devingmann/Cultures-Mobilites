#!/bin/bash
# Test E2E de l'API — Cultures et Mobilités
set -e
BASE="http://localhost:3000"
J="/tmp/cm-test-cookies.txt"; JA="/tmp/cm-admin-cookies.txt"
rm -f "$J" "$JA"

echo "1) Inscription membre avec code d'invitation…"
R=$(curl -s -c "$J" -H "Content-Type: application/json" -d '{"name":"Test Membre","email":"test.membre@example.fr","password":"Test2026pass","inviteCode":"CULTURE34"}' "$BASE/api/auth/register")
echo "   → $R" | head -c 200; echo

echo "2) Mauvais code d'invitation (doit échouer)…"
R=$(curl -s -H "Content-Type: application/json" -d '{"name":"Mauvais Code","email":"mauvais@example.fr","password":"Test2026pass","inviteCode":"FAUX"}' "$BASE/api/auth/register")
echo "   → $R"

echo "3) Connexion admin…"
R=$(curl -s -c "$JA" -H "Content-Type: application/json" -d '{"email":"admin@cultures-mobilites.fr","password":"Culture2026!"}' "$BASE/api/auth/login")
echo "   → $R" | head -c 200; echo

echo "4) /api/auth/me (membre)…"
curl -s -b "$J" "$BASE/api/auth/me"; echo

echo "5) Sondage (membre connecté)…"
POLL=$(curl -s -b "$J" "$BASE/api/poll")
OPT1=$(echo "$POLL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['options'][0]['id'])")
OPT2=$(echo "$POLL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['options'][1]['id'])")
echo "   votants avant : $(echo "$POLL" | python3 -c "import sys,json; print(json.load(sys.stdin)['voters'])")"

echo "6) Vote (2 choix)…"
curl -s -b "$J" -H "Content-Type: application/json" -d "{\"optionIds\":[\"$OPT1\",\"$OPT2\"]}" "$BASE/api/poll/vote" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   votants après :', d['voters'], '| mes votes :', len(d['myVotes']))"

echo "7) Upload d'une image de test…"
python3 -c "
from PIL import Image, ImageDraw
img = Image.new('RGB', (800, 600), (204, 251, 241))
d = ImageDraw.Draw(img)
d.ellipse((100, 100, 700, 500), fill=(249, 115, 22))
img.save('/tmp/test-photo.jpg', quality=85)
"
R=$(curl -s -b "$J" -F "files=@/tmp/test-photo.jpg" -F "title=Photo de test - Jardins de la Fontaine" -F "description=Test E2E" -F "category=PHOTO" "$BASE/api/files")
echo "   → $R" | head -c 220; echo
FILE_ID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['items'][0]['id'])")

echo "8) Liste du drive…"
curl -s -b "$J" "$BASE/api/files" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   total :', d['total'], '| taille :', d['totalSizeLabel'])"

echo "9) Lecture du fichier (membre)…"
curl -s -b "$J" -o /dev/null -w "   statut: %{http_code}, type: %{content_type}\n" "$BASE/api/files/$FILE_ID/raw"

echo "10) Lecture du fichier SANS connexion (doit être 401)…"
curl -s -o /dev/null -w "   statut: %{http_code}\n" "$BASE/api/files/$FILE_ID/raw"

echo "11) Création d'un article…"
R=$(curl -s -b "$J" -H "Content-Type: application/json" -d '{"title":"Mon témoignage de test","content":"Ceci est un témoignage de test pour vérifier le journal du groupe. La sortie était superbe et l\u0027atelier génial !","kind":"ARTICLE"}' "$BASE/api/posts")
SLUG=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['item']['slug'])")
echo "   → slug : $SLUG"

echo "12) Article public (sans connexion)…"
curl -s "$BASE/api/posts/$SLUG" | python3 -c "import sys,json; d=json.load(sys.stdin)['item']; print('   titre :', d['title'], '| média url :', d['media'])"

echo "13) Stats admin (avec cookie admin)…"
curl -s -b "$JA" "$BASE/api/admin/stats"; echo

echo "14) Paramètres admin…"
curl -s -b "$JA" "$BASE/api/admin/settings"; echo

echo "15) Stats admin SANS droits (doit être 403)…"
curl -s -b "$J" -o /dev/null -w "   statut: %{http_code}\n" "$BASE/api/admin/stats"

echo "16) Mauvais mot de passe admin x2 (doit être 401)…"
curl -s -H "Content-Type: application/json" -d '{"email":"admin@cultures-mobilites.fr","password":"FauxPass123"}' "$BASE/api/auth/login"; echo
curl -s -H "Content-Type: application/json" -d '{"email":"admin@cultures-mobilites.fr","password":"FauxPass456"}' "$BASE/api/auth/login"; echo

echo "17) Nettoyage : suppression du compte test par l'admin…"
USER_ID=$(curl -s -b "$J" "$BASE/api/auth/me" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])")
curl -s -b "$JA" -X DELETE -o /dev/null -w "   statut: %{http_code}\n" "$BASE/api/admin/users/$USER_ID"
curl -s -b "$JA" "$BASE/api/admin/stats" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   membres après nettoyage :', d['members'], '| fichiers :', d['files'])"

echo "=== FIN DES TESTS API ==="
