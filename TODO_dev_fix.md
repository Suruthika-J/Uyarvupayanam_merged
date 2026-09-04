# Fix npm run dev - Monorepo Development Setup

## Plan Status: ✅ APPROVED by user

Steps Completed: 0/4

## 📋 Steps

**1. [✅] Update root package.json**  
   - Add concurrently devDependency  
   - Add scripts: dev, dev:backend, dev:frontend  

**2. [✅] Install dependencies**  
   `npm install` - installs concurrently  

**3. [✅] Test development servers**  
   `npm run dev`  
   - Backend starts on http://localhost:5000  
   - Frontend starts on http://localhost:5173  

**4. [ ] Mark Complete**  
   - Remove this TODO or mark done  

**Current Progress:** Ready to update package.json  
**Expected Result:** Single `npm run dev` starts both servers with hot reload.
