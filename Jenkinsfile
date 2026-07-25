pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Install') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

    }
}