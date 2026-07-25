# Security: Secrets Management

## ⚠️ What Happened

Your `.env` file with real Google OAuth credentials was pushed to git history. This is a **security vulnerability** because:

1. GitHub public repository = anyone can see your secrets
2. Git history keeps all past commits = secrets not removed by just deleting the file
3. Anyone with these credentials can impersonate your app

## ✅ What I Fixed

### 1. Removed .env from Current Tracking
```bash
git rm --cached backend/.env
```
- Removes `.env` from the staging area
- File still exists locally (won't lose your config)
- Won't be tracked in future commits

### 2. Added .gitignore
Created `.gitignore` with:
```
backend/.env
frontend/.env.local
node_modules/
```
- Prevents accidental `.env` commits
- Works for all future commits

### 3. Created .env.example Templates
- `backend/.env.example` - Template for backend config
- `frontend/.env.local.example` - Template for frontend config
- Committed to git (safe, no secrets)
- Others can copy to `.env` and fill in their own values

## 🔐 Proper Setup for Team/Production

### Local Development
```bash
# 1. Clone repo
git clone https://github.com/AyaanB24/MERN-Devops-Job-Portal.git
cd MERN-Devops-Job-Portal

# 2. Copy template files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Fill in YOUR secrets
# Edit backend/.env and add real values:
GOOGLE_CLIENT_ID=your_real_google_client_id
GOOGLE_CLIENT_SECRET=your_real_google_client_secret
JWT_SECRET=your_random_secret_key

# 4. Never commit these files
# (They're already in .gitignore)
```

### Production (AWS/K8s)
Instead of .env files, use:

**Option 1: Environment Variables**
```bash
export GOOGLE_CLIENT_ID="your_real_id"
export GOOGLE_CLIENT_SECRET="your_real_secret"
export JWT_SECRET="your_secret"
```

**Option 2: AWS Secrets Manager** (Recommended)
```bash
# Store secrets in AWS
aws secretsmanager create-secret \
  --name prod/jobportal \
  --secret-string '{
    "GOOGLE_CLIENT_ID": "...",
    "GOOGLE_CLIENT_SECRET": "...",
    "JWT_SECRET": "..."
  }'

# App fetches at runtime
```

**Option 3: Kubernetes Secrets** (Recommended for K8s)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: jobportal-secrets
type: Opaque
data:
  GOOGLE_CLIENT_ID: base64_encoded_value
  GOOGLE_CLIENT_SECRET: base64_encoded_value
  JWT_SECRET: base64_encoded_value
```

## 🔄 About Git History

⚠️ **IMPORTANT:** The `.env` file is still in git history (past commits)!

### Why This Matters
- If someone clones an old commit, they can see the secrets
- `git log --all --full-history -- backend/.env` shows all past commits with the file

### How to Clean History (Advanced)

**Option 1: BFG Repo-Cleaner** (Recommended)
```bash
# Install: npm install -g bfg

# Remove .env from all history
bfg --delete-files backend/.env

# Force push cleaned history
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force-with-lease
```

**Option 2: git filter-branch** (Manual)
```bash
git filter-branch --tree-filter 'rm -f backend/.env' -- --all
git push origin --force-with-lease
```

⚠️ **WARNING:** Force pushing changes history for everyone. Notify your team!

## 🛡️ Best Practices Going Forward

### ✅ DO
- ✅ Keep `.env` in `.gitignore` (already done)
- ✅ Use `.env.example` as template (already done)
- ✅ Store secrets in AWS Secrets Manager / K8s Secrets
- ✅ Use environment variables in CI/CD (Jenkins, GitHub Actions)
- ✅ Rotate credentials periodically
- ✅ Use different credentials for dev/staging/prod

### ❌ DON'T
- ❌ Never commit real `.env` files
- ❌ Never hardcode secrets in code
- ❌ Never push Google OAuth secrets to GitHub
- ❌ Never use same credentials for all environments
- ❌ Never share credentials via Slack/Email

## 🔄 Your Google OAuth Credentials

**RECOMMENDATION:** Your Google OAuth credentials are exposed. You should:

1. **Revoke old credentials** in Google Cloud Console:
   - Go to https://console.cloud.google.com/
   - Navigate to Credentials
   - Delete the exposed OAuth 2.0 Client ID
   - Create a new one

2. **Update your app** with new credentials:
   - Create `backend/.env` from `backend/.env.example`
   - Add the new Google Client ID and Secret
   - Update `frontend/.env.local` with new Client ID

3. **Commit confirmation:**
   ```bash
   git status  # Should show no .env files
   ```

## 📚 Reference

- [GitHub Docs: Removing Secrets](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**Status:** ✅ Fixed in current commits  
**Action Required:** Regenerate Google OAuth credentials  
**For Prod:** Use AWS Secrets Manager or K8s Secrets
