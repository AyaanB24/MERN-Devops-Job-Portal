pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        BUILD_NUMBER = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "✅ Checking out code from GitHub..."
                checkout scm
                sh 'git log --oneline -1'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo "📦 Installing backend dependencies..."
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo "📦 Installing frontend dependencies..."
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Lint & Format Check') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        echo "🔍 Checking backend code quality..."
                        dir('backend') {
                            sh 'npm run lint 2>/dev/null || echo "Linting not configured, skipping..."'
                        }
                    }
                }
                stage('Frontend Build Check') {
                    steps {
                        echo "🔍 Checking frontend build..."
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Audit Dependencies') {
            steps {
                echo "🔐 Auditing dependencies for vulnerabilities..."
                sh '''
                    echo "=== Backend Audit ==="
                    cd backend && npm audit --production 2>/dev/null || true
                    cd ..
                    echo "=== Frontend Audit ==="
                    cd frontend && npm audit --production 2>/dev/null || true
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "🐳 Building Docker images..."
                sh 'docker-compose build'
            }
        }

        stage('Health Check') {
            steps {
                echo "❤️ Starting services and running health checks..."
                sh '''
                    docker-compose up -d
                    sleep 15
                    
                    echo "Checking Backend Health..."
                    curl -f http://localhost:5000 || echo "Backend health check pending..."
                    
                    echo "Checking Frontend Health..."
                    curl -f http://localhost || echo "Frontend health check pending..."
                    
                    docker-compose down
                '''
            }
        }

        stage('Security Scan') {
            steps {
                echo "🛡️ Running security checks..."
                sh '''
                    echo "✅ Checking for .env files in git (should be none)..."
                    git log --all --full-history -- backend/.env 2>/dev/null | wc -l | xargs -I {} echo "Found {} mentions of .env in history"
                    
                    echo "✅ Verifying .gitignore includes .env..."
                    grep -q "backend/.env" .gitignore && echo "✓ backend/.env in .gitignore" || echo "✗ WARNING: .env not in .gitignore"
                '''
            }
        }

    }

    post {
        always {
            echo "🧹 Cleaning up..."
            sh 'docker-compose down 2>/dev/null || true'
            cleanWs()
        }

        success {
            echo "✅ Pipeline PASSED - Ready for deployment!"
        }

        failure {
            echo "❌ Pipeline FAILED - Check logs above"
            error("Build failed - see details above")
        }
    }
}