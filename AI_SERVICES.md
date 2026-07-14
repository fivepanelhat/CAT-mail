# 🧠 AI Services Configuration Guide

CAT Mail supports **4 different AI backends**. Choose any one based on your preference and availability.

---

## 🆚 Comparison Table

| Feature | Claude | Gemini | OpenAI | Grok |
|---------|--------|--------|--------|------|
| **Provider** | Anthropic | Google | OpenAI | xAI |
| **Model** | Claude 3.5 Sonnet | Gemini Pro | GPT-4 Turbo | Grok-2 |
| **Cost** | $3-$15/M tokens | $0.075-$0.6/M tokens | $10-$30/M tokens | $5/M input, $15/M output |
| **Speed** | Fast | Very Fast | Very Fast | Fast |
| **Quality** | Excellent | Good | Excellent | Good |
| **Setup Difficulty** | Easy | Easy | Easy | Medium |
| **Privacy** | Strong | Strong | Strong | Strong |

---

## 🔐 Claude (Anthropic) - **RECOMMENDED**

### Setup

1. **Get API Key**
   - Visit: https://console.anthropic.com
   - Create account or sign in
   - Go to "API Keys"
   - Click "Create Key"

2. **Update `.env`**
   ```env
   AI_SERVICE=claude
   ANTHROPIC_API_KEY=sk-ant-your-api-key-here
   ```

3. **Test**
   ```bash
   npm run dev "show my unread emails"
   ```

### Pricing
- Input: $3 per million tokens
- Output: $15 per million tokens
- Free tier: Yes, limited usage

### Why Claude?
✅ Best for privacy  
✅ Strong instruction following  
✅ Excellent at email classification  
✅ Affordable  

---

## 🎨 Gemini (Google)

### Setup

1. **Get API Key**
   - Visit: https://makersuite.google.com
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Update `.env`**
   ```env
   AI_SERVICE=gemini
   GEMINI_API_KEY=your-gemini-key-here
   ```

3. **Test**
   ```bash
   npm run dev "delete spam emails"
   ```

### Pricing
- Input: $0.075 per million tokens
- Output: $0.3 per million tokens
- Free tier: Yes, very generous

### Why Gemini?
✅ Cheapest option  
✅ Very fast responses  
✅ Good at understanding context  
✅ Free tier is quite generous  

---

## 💡 OpenAI (GPT-4)

### Setup

1. **Get API Key**
   - Visit: https://platform.openai.com/account/api-keys
   - Sign in or create account
   - Click "Create new secret key"
   - Copy the key (won't show again)

2. **Add Billing**
   - Go to: https://platform.openai.com/account/billing/overview
   - Add payment method
   - Set usage limits (recommended: $5/month)

3. **Update `.env`**
   ```env
   AI_SERVICE=openai
   OPENAI_API_KEY=sk-proj-your-api-key-here
   ```

4. **Test**
   ```bash
   npm run dev "archive emails from 2024"
   ```

### Pricing
- Input: $10 per million tokens (GPT-4 Turbo)
- Output: $30 per million tokens
- Free trial: None (requires payment)

### Why OpenAI?
✅ Most powerful model  
✅ Best at complex tasks  
✅ Excellent reliability  
✅ Largest community  

---

## ⚡ Grok (xAI)

### Setup

1. **Get API Key**
   - Visit: https://console.x.ai
   - Sign in with X (Twitter) account
   - Create new API key
   - Copy the key

2. **Update `.env`**
   ```env
   AI_SERVICE=grok
   GROK_API_KEY=your-grok-api-key-here
   ```

3. **Test**
   ```bash
   npm run dev "block sender@domain.com"
   ```

### Pricing
- Input: $5 per million tokens
- Output: $15 per million tokens
- Free tier: Limited

### Why Grok?
✅ Fast and witty responses  
✅ Good at complex reasoning  
✅ Moderate pricing  
✅ New and innovative  

---

## 🔄 Switching Services

Change AI service anytime by updating `.env`:

```bash
# Currently using Claude
AI_SERVICE=claude
ANTHROPIC_API_KEY=sk-ant-...

# Switch to Gemini
AI_SERVICE=gemini
GEMINI_API_KEY=...

# Switch to OpenAI
AI_SERVICE=openai
OPENAI_API_KEY=sk-proj-...

# Switch to Grok
AI_SERVICE=grok
GROK_API_KEY=...
```

Then restart the application:
```bash
npm run dev "your command"
```

---

## 🎯 Recommendations

### For Cost-Conscious Users
→ **Gemini** (Free tier with generous limits)

### For Best Quality
→ **OpenAI** (Most capable, but priciest)

### For Privacy Focus
→ **Claude** (Best privacy controls, Anthropic's focus)

### For Speed
→ **Gemini** or **Grok** (Very fast responses)

### For Balanced Choice
→ **Claude** (Good balance of quality, cost, and privacy)

---

## 🔐 Privacy & Security Notes

**All services respect your privacy:**
- ✅ No email content is stored
- ✅ No data is retained after operation
- ✅ No behavioral profiling
- ✅ No third-party sharing
- ✅ All processing is in-memory only

**Each service has its own privacy policy:**
- Claude: https://www.anthropic.com/privacy
- Gemini: https://policies.google.com/privacy
- OpenAI: https://openai.com/privacy
- Grok: https://x.ai/privacy

---

## ⚙️ Configuration Examples

### Example 1: Full Config with Claude
```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/callback
TARGET_EMAIL=your@email.com

AI_SERVICE=claude
ANTHROPIC_API_KEY=sk-ant-your-key-here

LOG_LEVEL=INFO
```

### Example 2: OpenAI Setup
```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/callback
TARGET_EMAIL=your@email.com

AI_SERVICE=openai
OPENAI_API_KEY=sk-proj-your-key-here

LOG_LEVEL=INFO
```

### Example 3: Grok Setup
```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/callback
TARGET_EMAIL=your@email.com

AI_SERVICE=grok
GROK_API_KEY=your-grok-key-here

LOG_LEVEL=INFO
```

---

## 🆘 Troubleshooting

### "API key invalid"
- Verify you copied the key correctly
- Check it's still active in the provider's console
- Ensure .env file is in the project root

### "Service not responding"
- Check internet connection
- Verify API key has sufficient quota/credits
- Check for service outages on provider's status page

### "Switching services not working"
- Verify new API key in .env
- Restart the application completely
- Check logs for specific error messages

### "Quota exceeded"
- Check your usage in the provider's dashboard
- Consider using a different service
- Add billing/increase limits if available

---

## 📊 Token Usage Estimates

**Typical email operation:** 500-2000 tokens

| Operation | Tokens | Approx Cost (Claude) |
|-----------|--------|----------------------|
| Search emails | 500-800 | $0.015 |
| Delete emails | 400-600 | $0.012 |
| Send email | 600-1000 | $0.025 |
| Archive batch | 800-1200 | $0.035 |
| Classification | 1000-1500 | $0.045 |

**Monthly estimate** (10 operations/day):
- Claude: ~$1-2
- Gemini: ~$0.50
- OpenAI: ~$5-10
- Grok: ~$2-5

---

## 🚀 Getting Started

1. **Choose your AI service** (see recommendations above)
2. **Get API key** (follow setup for that service)
3. **Update `.env`** with credentials
4. **Test** with a simple command
5. **Enjoy** privacy-first email automation!

```bash
npm run dev "show my unread emails"
```

---

**Need help?** Check [QUICK_START.md](QUICK_START.md) or [README.md](README.md)

🔒 **Privacy First. Choose Your AI. Automate Your Email.**
