pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Backend Install') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm run build || echo "No build script found. Skipping..."'
                }
            }
        }

        stage('Frontend Install') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=job-portal \
                        -Dsonar.projectName=job-portal \
                        -Dsonar.sources=. \
                        -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh '''
                docker build \
                  -t jobportal-backend:latest \
                  ./backend
                '''
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh '''
                docker build \
                  -t jobportal-frontend:latest \
                  ./frontend
                '''
            }
        }

        stage('Scan Backend Image') {
            steps {
                sh '''
                mkdir -p reports
                mkdir -p $HOME/.cache/trivy

                ls -l $WORKSPACE/DevOps/trivy

                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  -v $HOME/.cache/trivy:/root/.cache/trivy \
                  -v $WORKSPACE/reports:/reports \
                  -v $WORKSPACE/DevOps/trivy/html.tpl:/tmp/html.tpl:ro \
                  aquasec/trivy:latest image \
                  --scanners vuln \
                  --severity HIGH,CRITICAL \
                  --exit-code 1 \
                  --format template \
                  --template "@/tmp/html.tpl" \
                  -o /reports/backend-trivy-report.html \
                  jobportal-backend:latest
                '''
            }
        }

        stage('Scan Frontend Image') {
            steps {
                sh '''
                mkdir -p reports
                mkdir -p $HOME/.cache/trivy

                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  -v $HOME/.cache/trivy:/root/.cache/trivy \
                  -v $WORKSPACE/reports:/reports \
                  -v $WORKSPACE/DevOps/trivy/html.tpl:/tmp/html.tpl:ro \
                  aquasec/trivy:latest image \
                  --scanners vuln \
                  --severity HIGH,CRITICAL \
                  --exit-code 1 \
                  --format template \
                  --template "@/tmp/html.tpl" \
                  -o /reports/frontend-trivy-report.html \
                  jobportal-frontend:latest
                '''
            }
        }
    }

    post {

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }

        always {
            archiveArtifacts artifacts: 'reports/*.html', fingerprint: true
            cleanWs()
        }
    }
}