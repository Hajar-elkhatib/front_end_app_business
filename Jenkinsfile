pipeline {
    agent any

    environment {
        IMAGE = "marouamrouji/frontend-app"
        TAG   = "1.0.${env.BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout') {
            steps {
                checkout scm
                echo '✅ Code récupéré depuis GitHub'
            }
        }

        stage('2. Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('3. Analyse SonarQube') {
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

        stage('4. Build Angular') {
            steps {
                sh 'npm run build -- --configuration production'
            }
        }

        stage('5. Build Docker Image') {
            steps {
                // 🟢 Hna zdna --no-cache bach i-akhd s-stora d l-code jdad completement
                sh "docker build --no-cache -t ${IMAGE}:${TAG} ."
                sh "docker tag ${IMAGE}:${TAG} ${IMAGE}:latest"
            }
        }

        stage('6. Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login -u \$USER --password-stdin"
                    sh "docker push ${IMAGE}:${TAG}"
                    sh "docker push ${IMAGE}:latest"
                }
            }
        }

        stage('7. Deploy avec Ansible') {
            steps {
                sh 'ssh -o StrictHostKeyChecking=no azureuser@74.161.163.110 "ansible-playbook -i ~/ansible/inventory.ini ~/ansible/deploy.yml"'
            }
        }
    }

    post {
        success {
            echo '🚀 Pipeline frontend réussi et déployé avec succès !'
        }
        failure {
            echo '❌ Pipeline frontend échoué — Vérifier les logs de build'
        }
        always {
            cleanWs() 
        }
    }
}
