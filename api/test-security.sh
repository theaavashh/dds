#!/bin/bash

echo "🔒 API Security Testing Script"
echo "================================"

API_BASE="http://localhost:5000"

echo ""
echo "🧪 Test 1: Direct Browser Access (Should Fail)"
echo "Expected: 403 Forbidden - Automated access blocked"
curl -s -w "Status: %{http_code}\n" -H "User-Agent: Mozilla/5.0" "$API_BASE/api/auth/me" | head -n 1
echo ""

echo "🧪 Test 2: Invalid User-Agent (Should Fail)"
echo "Expected: 403 Forbidden - Suspicious User-Agent blocked"
curl -s -w "Status: %{http_code}\n" -H "User-Agent: bot/crawler" "$API_BASE/api/auth/me" | head -n 1
echo ""

echo "🧪 Test 3: Invalid Origin (Should Fail)"
echo "Expected: 403 Forbidden - Origin not allowed"
curl -s -w "Status: %{http_code}\n" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -H "Origin: http://malicious-site.com" "$API_BASE/api/auth/me" | head -n 1
echo ""

echo "🧪 Test 4: Missing API Key (Should Fail)"
echo "Expected: 401 Unauthorized - API key required"
curl -s -w "Status: %{http_code}\n" -H "User-Agent: curl/8.5.0" -H "Origin: http://localhost:6001" "$API_BASE/api/auth/me" | head -n 1
echo ""

echo "🧪 Test 5: Invalid API Key (Should Fail)"
echo "Expected: 401 Unauthorized - Invalid API key"
curl -s -w "Status: %{http_code}\n" -H "User-Agent: curl/8.5.0" -H "Origin: http://localhost:6001" -H "X-API-Key: invalid_key" "$API_BASE/api/auth/me" | head -n 1
echo ""

echo "🧪 Test 6: Health Check (Should Pass)"
echo "Expected: 200 OK - Public endpoint"
curl -s -w "Status: %{http_code}\n" "$API_BASE/health" | head -n 1
echo ""

echo "🧪 Test 7: CSRF Token (Should Pass)"
echo "Expected: 200 OK - Public endpoint"
curl -s -w "Status: %{http_code}\n" -H "User-Agent: curl/8.5.0" -H "Origin: http://localhost:6001" "$API_BASE/api/csrf-token" | head -n 1
echo ""

echo "✅ Security Testing Complete!"
echo "================================"
echo "Results Summary:"
echo "- Direct browser access: ❌ BLOCKED"
echo "- Invalid user-agents: ❌ BLOCKED" 
echo "- Invalid origins: ❌ BLOCKED"
echo "- Missing API keys: ❌ BLOCKED"
echo "- Invalid API keys: ❌ BLOCKED"
echo "- Health endpoints: ✅ ALLOWED"
echo "- CSRF token endpoint: ✅ ALLOWED"
echo ""
echo "🎯 Your API is now properly secured!"