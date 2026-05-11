pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code récupéré depuis GitHub ✓'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Analyse SonarQube') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        npx sonar-scanner \
                        -Dsonar.projectKey=frontend-app \
                        -Dsonar.projectName=frontend-app \
                        -Dsonar.sources=src
                    '''
                }
            }
        }

        stage('Build Angular') {
            steps {
                sh 'npm run build -- --configuration production'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t frontend-app .'
            }
        }

    }

    post {
        success {
            echo '✅ Pipeline frontend réussi !'
        }
        failure {
            echo '❌ Pipeline frontend échoué — vérifier les logs'
        }
        always {
            cleanWs()
        }
    }
}
