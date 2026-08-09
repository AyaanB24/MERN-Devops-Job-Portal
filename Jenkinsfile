pipeline {
    agent any

    environment {
        DOCKER_BACKEND_IMAGE  = "ayaanb2324/jobportal-backend"
        DOCKER_FRONTEND_IMAGE = "ayaanb2324/jobportal-frontend"

        GITOPS_REPO = "https://github.com/AyaanB24/jobportal-gitops.git"
        GITOPS_BRANCH = "main"
    }

    stages {

        // ============================================================
        // 1. CHECKOUT APPLICATION SOURCE
        // ============================================================

        stage('Checkout') {
            steps {
                echo 'Checking out application source code...'
                checkout scm
            }
        }

        stage('Configure npm cache') {
            steps {
                sh '''
                    npm config set cache /var/jenkins_home/.npm
                '''
            }
        }


        // ============================================================
        // 2. BACKEND
        // ============================================================

        stage('Backend Install') {
            steps {
                dir('backend') {
                    sh 'npm ci --prefer-offline'
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh '''
                        npm run build || echo "No build script found. Skipping..."
                    '''
                }
            }
        }


        // ============================================================
        // 3. FRONTEND
        // ============================================================

        stage('Frontend Install') {
            steps {
                dir('frontend') {
                    sh 'npm ci --prefer-offline'
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


        // ============================================================
        // 4. SONARQUBE
        // ============================================================

        stage('SonarQube Analysis') {
            steps {
                script {

                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {

                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=job-portal \
                            -Dsonar.projectName=job-portal \
                            -Dsonar.sources=backend/src,frontend/src \
                            -Dsonar.sourceEncoding=UTF-8 \
                            -Dsonar.javascript.node.maxspace=2048 \
                            -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/*.min.js
                        """
                    }
                }
            }
        }


        // ============================================================
        // 5. QUALITY GATE
        // ============================================================

        stage('Quality Gate') {
            steps {

                timeout(time: 5, unit: 'MINUTES') {

                    waitForQualityGate abortPipeline: false

                }
            }
        }


        // ============================================================
        // 6. BUILD BACKEND DOCKER IMAGE
        // ============================================================

        stage('Build Backend Docker Image') {
            steps {

                sh '''
                    echo "Building backend image..."

                    docker build \
                        -t ${DOCKER_BACKEND_IMAGE}:${BUILD_NUMBER} \
                        ./backend

                    echo "Backend image created:"
                    docker images ${DOCKER_BACKEND_IMAGE}
                '''
            }
        }


        // ============================================================
        // 7. BUILD FRONTEND DOCKER IMAGE
        // ============================================================

        stage('Build Frontend Docker Image') {
            steps {

                sh '''
                    echo "Building frontend image..."

                    docker build \
                        -t ${DOCKER_FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        ./frontend

                    echo "Frontend image created:"
                    docker images ${DOCKER_FRONTEND_IMAGE}
                '''
            }
        }


        // ============================================================
        // 8. TRIVY BACKEND SCAN
        // ============================================================

        stage('Scan Backend Image') {
            steps {

                sh '''
                    echo "Scanning backend image with Trivy..."

                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v trivy-cache:/root/.cache/trivy \
                        aquasec/trivy:latest image \
                        --skip-db-update \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        ${DOCKER_BACKEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }


        // ============================================================
        // 9. TRIVY FRONTEND SCAN
        // ============================================================

        stage('Scan Frontend Image') {
            steps {

                sh '''
                    echo "Scanning frontend image with Trivy..."

                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v trivy-cache:/root/.cache/trivy \
                        aquasec/trivy:latest image \
                        --skip-db-update \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        ${DOCKER_FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }


        // ============================================================
        // 10. DOCKER HUB LOGIN
        // ============================================================

        stage('Docker Hub Login') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            -u "$DOCKER_USERNAME" \
                            --password-stdin
                    '''
                }
            }
        }


        // ============================================================
        // 11. PUSH BACKEND IMAGE
        // ============================================================

        stage('Push Backend Image') {
            steps {

                sh '''
                    echo "Pushing backend image..."

                    docker push \
                        ${DOCKER_BACKEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }


        // ============================================================
        // 12. PUSH FRONTEND IMAGE
        // ============================================================

        stage('Push Frontend Image') {
            steps {

                sh '''
                    echo "Pushing frontend image..."

                    docker push \
                        ${DOCKER_FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }


        // ============================================================
        // 13. UPDATE GITOPS REPOSITORY
        // ============================================================

        stage('Update GitOps Repository') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-gitops',
                        usernameVariable: 'GIT_USERNAME',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "Cloning GitOps repository..."

                        rm -rf gitops

                        git clone \
                            --branch ${GITOPS_BRANCH} \
                            https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/AyaanB24/jobportal-gitops.git \
                            gitops

                        cd gitops


                        echo "Updating backend image..."

                        sed -i \
                            "s|image: ayaanb2324/jobportal-backend:.*|image: ayaanb2324/jobportal-backend:${BUILD_NUMBER}|" \
                            k8s/backend-deployment.yaml


                        echo "Updating frontend image..."

                        sed -i \
                            "s|image: ayaanb2324/jobportal-frontend:.*|image: ayaanb2324/jobportal-frontend:${BUILD_NUMBER}|" \
                            k8s/frontend-deployment.yaml


                        echo "Updated images:"

                        grep "image:" k8s/backend-deployment.yaml
                        grep "image:" k8s/frontend-deployment.yaml


                        echo "Configuring Git..."

                        git config user.name "Jenkins"
                        git config user.email "jenkins@localhost"


                        echo "Checking Git changes..."

                        git status


                        git add \
                            k8s/backend-deployment.yaml \
                            k8s/frontend-deployment.yaml


                        git commit \
                            -m "chore: deploy application build ${BUILD_NUMBER}"


                        echo "Pushing changes to GitOps repository..."

                        git push origin ${GITOPS_BRANCH}


                        echo "GitOps repository updated successfully."

                    '''
                }
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================

    post {

        // ============================================================
        // SUCCESS
        // ============================================================

        success {

            withCredentials([
                string(
                    credentialsId: 'slack-webhook',
                    variable: 'SLACK_WEBHOOK'
                )
            ]) {

                sh '''
                    curl -X POST \
                        -H "Content-type: application/json" \
                        --data "{
                            \\"text\\": \\"✅ *Job Portal Pipeline Succeeded*\\nJob: ${JOB_NAME}\\nBuild: #${BUILD_NUMBER}\\nDocker Images: ${DOCKER_BACKEND_IMAGE}:${BUILD_NUMBER}, ${DOCKER_FRONTEND_IMAGE}:${BUILD_NUMBER}\\nGitOps repository updated.\\nArgo CD will synchronize the deployment.\\n${BUILD_URL}\\"
                        }" \
                        "$SLACK_WEBHOOK"
                '''
            }

            echo 'Pipeline completed successfully.'
            echo "Backend Image: ${DOCKER_BACKEND_IMAGE}:${BUILD_NUMBER}"
            echo "Frontend Image: ${DOCKER_FRONTEND_IMAGE}:${BUILD_NUMBER}"
            echo 'GitOps repository updated.'
            echo 'Argo CD will deploy the new version.'
        }


        // ============================================================
        // FAILURE
        // ============================================================

        failure {

            withCredentials([
                string(
                    credentialsId: 'slack-webhook',
                    variable: 'SLACK_WEBHOOK'
                )
            ]) {

                sh '''
                    curl -X POST \
                        -H "Content-type: application/json" \
                        --data "{
                            \\"text\\": \\"❌ *Job Portal Pipeline Failed*\\nJob: ${JOB_NAME}\\nBuild: #${BUILD_NUMBER}\\n${BUILD_URL}\\"
                        }" \
                        "$SLACK_WEBHOOK"
                '''
            }

            echo 'Pipeline failed.'
        }


        // ============================================================
        // ALWAYS
        // ============================================================

        always {

            echo 'Cleaning Jenkins workspace...'

            cleanWs()
        }
    }
}