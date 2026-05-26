pipeline {
    agent any

    environment {
        IMAGE = "marouamrouji/frontend-app"
        TAG = "1.0.${env.BUILD_NUMBER}"
    }

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
                sh "docker build -t ${IMAGE}:${TAG} ."
                sh "docker tag ${IMAGE}:${TAG} ${IMAGE}:latest"
            }
        }

        stage('Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${IMAGE}:${TAG}"
                    sh "docker push ${IMAGE}:latest"
                }
            }
        }

        stage('Deploy avec Ansible') {
            steps {
                sh 'ansible-playbook -i /home/azureuser/ansible/inventory.ini /home/azureuser/ansible/deploy.yml'
            }
        }

    }

    post {
        success {
            echo ' Pipeline frontend réussi !'
        }
        failure {
            echo ' Pipeline frontend échoué — vérifier les logs'
        }
        always {
            cleanWs()
        }
    }
}
