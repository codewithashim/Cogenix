# Troubleshooting Guide

## "Sorry, I encountered an error processing your request"

This error typically means the chat API couldn't connect to Ollama or process the response.

### Quick Checks

#### 1. **Is Ollama Running?**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return a list of models
# If it fails, start Ollama:
ollama serve
```

#### 2. **Check Dev Server Logs**

Look at your terminal where `npm run dev` is running. You should see the actual error message there.

#### 3. **Check Browser Console**

Open DevTools (F12) → Console tab to see detailed error messages.

### Common Issues & Solutions

#### Issue: Ollama Not Running

**Symptoms**: Connection refused error

**Solution**:
```bash
# Start Ollama
ollama serve

# In another terminal, verify it's running
curl http://localhost:11434/api/tags
```

#### Issue: Model Not Available

**Symptoms**: Model not found error

**Solution**:
```bash
# Check available models
ollama list

# Pull the model you need
ollama pull llama3
ollama pull mistral
```

#### Issue: MongoDB Connection Error

**Symptoms**: Database connection failed

**Solution**:
1. Check `.env.local` has correct `MONGODB_URI`
2. Verify MongoDB Atlas is accessible
3. Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for testing)

#### Issue: Port Already in Use

**Symptoms**: EADDRINUSE error

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Debugging Steps

#### 1. Enable Detailed Logging

Add console.logs to see what's failing:

```typescript
// In src/app/api/chat/route.ts
console.log('Ollama URL:', env.ollamaUrl);
console.log('Request body:', body);
```

#### 2. Test Ollama Directly

```bash
# Test chat endpoint
curl http://localhost:11434/api/chat \
  -d '{
    "model": "llama3",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'
```

#### 3. Check Environment Variables

```bash
# View .env.local
cat .env.local

# Should show:
# OLLAMA_URL=http://localhost:11434
# MONGODB_URI=mongodb+srv://...
```

### Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | Ollama not running | Start Ollama: `ollama serve` |
| "Model not found" | Model not pulled | Pull model: `ollama pull llama3` |
| "MongoDB connection error" | DB not accessible | Check MONGODB_URI, IP whitelist |
| "Messages array is required" | Invalid request | Check request format |
| "Failed to get response from backend" | Ollama error | Check Ollama logs |

### Still Having Issues?

1. **Restart Everything**:
   ```bash
   # Stop dev server (Ctrl+C)
   # Stop Ollama (Ctrl+C)
   
   # Start Ollama
   ollama serve
   
   # Start dev server (in another terminal)
   npm run dev
   ```

2. **Check System Resources**:
   - Ollama needs significant RAM (4-8GB+)
   - Models need disk space
   - Check `htop` or Activity Monitor

3. **View Full Error Stack**:
   - Check terminal where `npm run dev` is running
   - Look for the full error stack trace
   - Check browser DevTools Console

### Contact Points

If error persists:
1. Check terminal output for detailed error
2. Check browser console for frontend errors
3. Verify all services are running
4. Test Ollama independently

---

**Quick Fix Checklist**:
- [ ] Ollama is running (`ollama serve`)
- [ ] Model is pulled (`ollama list`)
- [ ] Dev server is running (`npm run dev`)
- [ ] .env.local is configured
- [ ] No port conflicts
- [ ] MongoDB is accessible

