<div align="center">

# MERN DevOps Job Portal

### Production-Grade MERN Application with CI/CD, DevSecOps, GitOps, Kubernetes, Auto Scaling & Observability

A complete end-to-end DevOps implementation of a MERN Job Portal — from application development and containerization to automated security scanning, Kubernetes deployment, GitOps-based delivery, auto-scaling, load testing, and monitoring.

**Project Status: COMPLETED**

[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](#)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](#)
[![Argo CD](https://img.shields.io/badge/Argo%20CD-GitOps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)](#)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)](#)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?style=for-the-badge&logo=grafana&logoColor=white)](#)

</div>

---

## Overview

This project is a full-stack MERN Job Portal built and deployed using a production-oriented DevOps workflow.

The objective was not only to build a functional web application, but to implement the complete software delivery lifecycle — from code to a monitored, auto-scaling Kubernetes deployment:


### 2. Jenkins CI/CD Pipeline

```mermaid
flowchart LR
    G["Git Push"] --> J["Jenkins"]
    J --> BI["Backend Install"]
    J --> BB["Backend Build"]
    J --> FI["Frontend Install"]
    J --> FB["Frontend Build"]
    BI --> S["SonarQube"]
    BB --> S
    FI --> S
    FB --> S
    S --> T["Trivy Scan"]
    T --> O["OWASP Dependency Check"]
    O --> DB["Docker Build"]
    DB --> DH["Docker Hub"]
    DH --> GP["Update GitOps Repository"]
    GP --> A["Argo CD"]
    A --> K["Kubernetes"]
```

**Pipeline stages:** source checkout → backend install/build → frontend install/build → SonarQube analysis → Quality Gate → Trivy scan → OWASP Dependency-Check → Docker image build → Docker Hub push → GitOps manifest update → Slack notification.

### 3. DevSecOps

Security is integrated directly into the CI pipeline rather than treated as a separate manual step.

- **SonarQube** — code quality, bugs, code smells, maintainability, Quality Gate validation
- **Trivy** — OS, package, and application dependency vulnerability scanning on container images
- **OWASP Dependency-Check** — vulnerable third-party dependency detection

### 4. Docker Image Registry

Images are versioned by Jenkins build number for traceability between a build and its deployed version:
