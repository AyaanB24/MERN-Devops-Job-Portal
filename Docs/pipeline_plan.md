# CI/CD Pipeline Implementation Plan

**Project:** MERN DevOps Job Portal  
**Status:** Planning Phase  
**Timeline:** 12 weeks  
**Current State:** Docker Compose (Local)  
**Target State:** Kubernetes + ArgoCD + Monitoring (Production)

---

## Phase Overview

| Phase | Name | Focus | Duration | Tools |
|-------|------|-------|----------|-------|
| 1 | Linting & Code Quality | ESLint, Prettier | Week 1 | ESLint, Prettier |
| 2 | Unit Testing | Jest tests, Coverage | Week 1-2 | Jest, React Testing Library |
| 3 | CI Pipeline Setup | Jenkins, GitHub Webhook | Week 2 | Jenkins, GitHub |
| 4 | Security Scanning | npm audit, OWASP, Trivy | Week 3 | npm audit, Trivy, OWASP |
| 5 | Container Security | Image scanning, CVE check | Week 3-4 | Trivy, Docker |
| 6 | Artifact Management | Docker Hub, Versioning | Week 4 | Docker Hub, Semantic versioning |
| 7 | CD Pipeline | Auto deployment, Rollback | Week 5 | Jenkins, Docker Compose |
| 8 | Kubernetes Setup | K8s manifests, Deployments | Week 6-7 | Kubernetes, Helm |
| 9 | GitOps | ArgoCD, Git sync | Week 7-8 | ArgoCD |
| 10 | Monitoring | Prometheus, Grafana | Week 8 | Prometheus, Grafana |
| 11 | Custom Metrics | prom-client, Dashboards | Week 9 | prom-client |
| 12 | Alerting | Alertmanager, Slack | Week 9 | Alertmanager, Slack |
| 13 | Hardening | Helmet, Rate limits, Probes | Week 10 | Helmet.js, Network policies |
| 14 | AWS Deployment | EC2/EKS, Route53, SSL | Week 11-12 | AWS services |
| 15 | Production Ready | Documentation, Final testing | Week 12 | - |

---

## Phase 1: Linting & Code Quality

### Install Dependencies
```bash
# Frontend
npm install --save-dev eslint @eslint/js eslint-plugin-react prettier eslint-config-prettier

# Backend
npm install --save-dev eslint prettier eslint-config-prettier
```

### Setup
- Create `.eslintrc.json` in frontend and backend
- Create `.prettierrc` config file
- Add lint scripts to `package.json`: `lint`, `lint:fix`, `format`

### Run
```bash
npm run lint:check    # Verify no errors
npm run format        # Auto-fix formatting
```

### Success Criteria
- ✅ All files pass ESLint
- ✅ Code formatted consistently
- ✅ No linting errors in CI

---

## Phase 2: Unit Testing

### Install Dependencies
```bash
# Frontend
npm install --save-dev jest @testing-library/react vitest

# Backend
npm install --save-dev jest supertest @babel/preset-env
```

### Setup
- Configure Jest in `package.json`
- Write test files for critical paths (auth, API, components)
- Create `jest.config.js`

### Run
```bash
npm run test:ci    # Run tests once (for CI)
npm run test:coverage    # Generate coverage report
```

### Success Criteria
- ✅ 70%+ code coverage
- ✅ All critical paths tested
- ✅ CI fails on test failure

---

## Phase 3: CI Pipeline Setup

### Install & Setup
- Install Jenkins (Docker container)
- Create Jenkinsfile in repository root
- Configure GitHub webhook → Jenkins

### Jenkinsfile Stages
1. Checkout code
2. Install dependencies (parallel: frontend + backend)
3. Run lint checks (parallel: frontend + backend)
4. Run unit tests (parallel: frontend + backend)
5. Integration tests
6. Generate reports

### Success Criteria
- ✅ Jenkins auto-triggers on git push
- ✅ Pipeline runs all stages
- ✅ Reports available in Jenkins UI
- ✅ Failure blocks merge

---

## Phase 4: Security Scanning

### Install Tools
```bash
# npm audit (built-in)
# OWASP Dependency-Check (Jenkins plugin)
# Trivy (CLI tool)
```

### Scanning
- **npm audit**: Check for known vulnerabilities
- **OWASP**: Deep dependency scanning
- **Trivy**: Filesystem & dependency scanning

### CI Integration
Add stages to Jenkinsfile:
- `npm audit --audit-level=moderate`
- `dependency-check.sh --scan .`
- `trivy fs . --severity HIGH,CRITICAL`

### Success Criteria
- ✅ No critical vulnerabilities
- ✅ Security reports generated
- ✅ Pipeline blocks on critical issues

---

## Phase 5: Container Security

### Dockerfile Best Practices
- Use Alpine Linux for small images
- Non-root user (USER appuser)
- Multi-stage builds
- No secrets in images

### Trivy Image Scanning
```bash
trivy image --severity HIGH,CRITICAL <image-name>
```

### CI Integration
Add to Jenkinsfile after Docker build:
- Build image
- Scan with Trivy
- Fail pipeline if critical vulnerabilities found
- Generate security report

### Success Criteria
- ✅ Images have no critical vulnerabilities
- ✅ Scanning automated in CI
- ✅ Report saved as artifact

---

## Phase 6: Artifact Management

### Docker Hub Setup
- Create account on Docker Hub
- Create repositories: `mern-job-portal/frontend` & `backend`
- Add credentials to Jenkins

### Versioning Strategy
- Tag with: `latest`, `v1.0.0`, `build-123`
- Keep last 10 builds
- Semantic versioning (MAJOR.MINOR.PATCH)

### Push to Registry
Add to Jenkinsfile:
- Build image with version tag
- Push all tags to Docker Hub
- Cleanup old images

### Success Criteria
- ✅ Images pushed to Docker Hub
- ✅ Version tagging working
- ✅ Old images auto-cleaned

---

## Phase 7: CD Pipeline

### Staging Deployment
- Pull latest image from Docker Hub
- Update docker-compose.staging.yml
- Run `docker-compose up -d`
- Run smoke tests

### Production Deployment
- Require manual approval (Slack notification)
- Pull production image
- Update docker-compose.prod.yml
- Verify health checks
- Rollback on failure

### Health Checks
- API `/health` endpoint (returns status)
- Wait 30 seconds after deploy
- Retry failed checks
- Auto-rollback if health checks fail

### Success Criteria
- ✅ Staging auto-deploys on merge
- ✅ Production requires approval
- ✅ Auto-rollback works
- ✅ Zero-downtime deployments

---

## Phase 8: Kubernetes Setup

### Install & Setup
- Create Kubernetes cluster (local: minikube, cloud: EKS/GKE)
- Create namespace: `jobportal`
- Write K8s manifests for all services

### Kubernetes Resources Needed
- Deployments (frontend, backend, MongoDB)
- Services (ClusterIP, LoadBalancer)
- ConfigMaps (environment variables)
- Secrets (API keys, passwords)
- PersistentVolumeClaims (for data)
- Ingress (for routing)

### Deploy
```bash
kubectl apply -f k8s/
```

### Success Criteria
- ✅ All pods running
- ✅ Services accessible
- ✅ Data persisting
- ✅ Health checks passing

---

## Phase 9: GitOps with ArgoCD

### Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Setup
- Create Git repository for K8s manifests (or use existing)
- Create ArgoCD Applications pointing to Git repo
- Enable auto-sync (watch Git → auto-deploy)

### Git Repository Structure
```
k8s/
├── base/
│   ├── backend/
│   ├── frontend/
│   └── mongodb/
└── overlays/
    ├── dev/
    ├── staging/
    └── prod/
```

### Success Criteria
- ✅ Git repo is source of truth
- ✅ Changes auto-deploy to cluster
- ✅ Rollback via Git revert
- ✅ Dashboard shows sync status

---

## Phase 10: Monitoring (Prometheus & Grafana)

### Install
```bash
# Prometheus: Collect metrics
# Grafana: Visualize metrics
# Node Exporter: Collect system metrics
```

### Setup
- Deploy Prometheus in K8s (scrapes every 15s)
- Deploy Grafana (connects to Prometheus)
- Configure Node Exporter DaemonSet (runs on all nodes)

### Metrics Collected
- CPU, Memory, Disk usage
- Pod restarts, Node status
- HTTP requests, Latency
- Container info

### Success Criteria
- ✅ Prometheus scraping metrics
- ✅ Grafana dashboard showing data
- ✅ Historical data stored
- ✅ Metrics accessible via API

---

## Phase 11: Custom Application Metrics

### Install prom-client
```bash
npm install prom-client
```

### Add Metrics
- HTTP request count
- Request latency (histogram)
- Active users (gauge)
- Jobs created (counter)
- Errors per endpoint

### Expose Metrics
- Add `/metrics` endpoint in backend
- Prometheus scrapes this endpoint
- Display in Grafana dashboards

### Success Criteria
- ✅ Custom metrics exposed
- ✅ Scraped by Prometheus
- ✅ Visualized in Grafana
- ✅ Business KPIs tracked

---

## Phase 12: Alerting

### Install AlertManager
```bash
# Part of Prometheus stack
```

### Setup
- Define alert rules (CPU > 80%, Memory > 80%, Errors > 5%)
- Configure Slack webhook
- Create AlertManager config

### Alert Rules
- HighCPU: trigger if > 80% for 5 min
- HighMemory: trigger if < 20% free
- PodRestarts: trigger if restarting frequently
- APIErrors: trigger if error rate > 5%
- DBDown: trigger if MongoDB unreachable

### Success Criteria
- ✅ Alerts firing correctly
- ✅ Slack notifications working
- ✅ No false positives
- ✅ Team responding to alerts

---

## Phase 13: Production Hardening

### Security
- Install Helmet.js (security headers)
- Rate limiting middleware (prevent abuse)
- CORS restriction (only allowed origins)
- Network policies (pod-to-pod communication)
- Non-root container user

### Reliability
- Liveness probes (restart dead containers)
- Readiness probes (don't route traffic to starting pods)
- Resource limits (CPU, Memory quotas)
- Health check endpoints (`/health`, `/ready`)

### Performance
- Enable caching headers
- Gzip compression (in Nginx)
- Database indexing
- Connection pooling

### Success Criteria
- ✅ Security headers present
- ✅ Rate limits working
- ✅ Pods self-healing
- ✅ Resources allocated correctly

---

## Phase 14: AWS Deployment

### Infrastructure
- **EC2**: Launch Ubuntu instance (t3.medium)
- **RDS**: MongoDB managed service (DocumentDB) or host on EC2
- **Route53**: DNS management
- **Certificate Manager**: SSL/TLS certificates
- **S3**: Resume file storage
- **CloudWatch**: Monitoring and logs
- **EKS** (optional): Managed Kubernetes cluster

### Deployment Options
**Option A: EC2 + Docker Compose**
- SSH into EC2
- Clone repo, start docker-compose
- Simple, cost-effective

**Option B: EKS Cluster**
- Create EKS cluster
- Deploy K8s manifests
- Auto-scaling, high availability

### DNS & SSL
- Create Route53 hosted zone
- Point domain to ELB or EC2 IP
- Issue certificate via AWS Certificate Manager
- Configure HTTPS

### Success Criteria
- ✅ Application accessible via domain
- ✅ HTTPS working
- ✅ CloudWatch metrics visible
- ✅ Automated backups running

---

## Phase 15: Production Ready

### Final Checklist
- ✅ All CI/CD stages passing
- ✅ Security scanning clean
- ✅ Monitoring active
- ✅ Alerts configured
- ✅ Backup strategy implemented
- ✅ Documentation complete
- ✅ Team trained
- ✅ Incident response plan ready

### Documentation
- Deployment runbook
- Troubleshooting guide
- Runbook for common issues
- On-call procedures

### Success Criteria
- ✅ Zero critical bugs in production
- ✅ MTTR (Mean Time To Recover) < 30 min
- ✅ Team confident in deployments
- ✅ Ready for next release cycle

---

## Pipeline Flow Summary

```
Code Push
  ↓
GitHub Webhook
  ↓
Jenkins CI (Lint → Test → Scan → Build)
  ↓
Docker Hub (Push Image)
  ↓
Deploy to Staging
  ↓
Manual Approval
  ↓
Deploy to Production (ArgoCD)
  ↓
Monitoring (Prometheus/Grafana)
  ↓
Alerting (Slack)
  ↓
Incident Response
```

---

## Tools Summary

| Tool | Purpose | Phase |
|------|---------|-------|
| ESLint, Prettier | Code quality | 1 |
| Jest | Testing | 2 |
| Jenkins | CI automation | 3 |
| npm audit, Trivy | Security scanning | 4-5 |
| Docker Hub | Registry | 6 |
| ArgoCD | GitOps | 9 |
| Prometheus | Metrics collection | 10 |
| Grafana | Visualization | 10 |
| AlertManager | Alerting | 12 |
| Helmet.js | Security headers | 13 |
| AWS | Cloud infrastructure | 14 |

---

## Timeline Breakdown

- **Weeks 1-2**: Linting, Testing, CI setup (Phases 1-3)
- **Weeks 3-4**: Security scanning (Phases 4-5)
- **Weeks 5-6**: Artifact management, CD pipeline (Phases 6-7)
- **Weeks 7-8**: Kubernetes, GitOps (Phases 8-9)
- **Weeks 9-10**: Monitoring, Alerting (Phases 10-12)
- **Weeks 11-12**: Hardening, AWS, Production ready (Phases 13-15)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Build Success Rate | ≥ 95% |
| Test Coverage | ≥ 70% |
| Security Scan Pass | 0 critical issues |
| Deployment Frequency | Daily |
| MTTR (Recovery Time) | < 30 min |
| Uptime | ≥ 99.5% |

---

**Version:** 1.0.0  
**Last Updated:** July 21, 2026  
**Status:** Ready for Implementation

