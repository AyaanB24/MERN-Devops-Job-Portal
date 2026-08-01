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
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  -v trivy-cache:/root/.cache/trivy \
                  aquasec/trivy:latest image \
                  --skip-db-update \
                  --severity HIGH,CRITICAL \
                  --exit-code 0 \
                  jobportal-backend:latest
                '''
            }
        }

        stage('Scan Frontend Image') {
            steps {
                sh '''
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  -v trivy-cache:/root/.cache/trivy \
                  aquasec/trivy:latest image \
                  --skip-db-update \
                  --severity HIGH,CRITICAL \
                  --exit-code 0 \
                  jobportal-frontend:latest
                '''
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                    echo "$DOCKER_PASSWORD" | docker login \
                      -u "$DOCKER_USERNAME" \
                      --password-stdin
                    '''
                }
            }
        }

        stage('Tag Docker Images') {
            steps {
                sh '''
                docker tag jobportal-backend:latest ayaanb2324/jobportal-backend:latest
                docker tag jobportal-frontend:latest ayaanb2324/jobportal-frontend:latest
                '''
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                docker push ayaanb2324/jobportal-backend:latest
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                docker push ayaanb2324/jobportal-frontend:latest
                '''
            }
        }
    }

    post {

    success {
        withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
            sh '''
            curl -X POST -H "Content-type: application/json" \
            --data "{
                \\"text\\": \\"✅ *Pipeline Succeeded*\\nJob: ${JOB_NAME}\\nBuild: #${BUILD_NUMBER}\\n${BUILD_URL}\\"
            }" \
            $SLACK_WEBHOOK
            '''
        }

        echo 'Pipeline completed successfully.'
    }

    failure {
        withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
            sh '''
            curl -X POST -H "Content-type: application/json" \
            --data "{
                \\"text\\": \\"❌ *Pipeline Failed*\\nJob: ${JOB_NAME}\\nBuild: #${BUILD_NUMBER}\\n${BUILD_URL}\\"
            }" \
            $SLACK_WEBHOOK
            '''
        }

        echo 'Pipeline failed.'
    }

    always {
        cleanWs()
    }
}
}
