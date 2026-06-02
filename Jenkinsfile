pipeline {
    agent any

    environment {
        IMAGE = "marouamrouji/frontend-app"
        TAG = "1.0.${env.BUILD_NUMBER}"
    }

    stages {

        stage('1. Checkout') {
            steps {
                checkout scm
                echo 'Code récupéré depuis GitHub ✓'
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
                sh "docker build -t ${IMAGE}:${TAG} ."
                sh "docker tag ${IMAGE}:${TAG} ${IMAGE}:latest"
            }
        }

        // 🔥 [Trivy Scan ❌ t-mseh men hna kima bghiti]

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
            script {
                echo 'Pipeline frontend réussi !'
                sh """
                curl -X POST https://api.telegram.org/bot<TON_TOKEN>/sendMessage \
                -d chat_id=<TON_CHAT_ID> \
                -d text="🚀 *Jenkins Pipeline SUCCESS* %0A%0A🔹 *Projet:* ${env.JOB_NAME} %0A🔹 *Build:* #${env.BUILD_NUMBER} %0A🔹 *Statut:* Tout l'écosystème (Front, Backend, IA) est déployé sur Azure ! 🎉"
                """
            }
        }
        failure {
            script {
                echo 'Pipeline frontend échoué — vérifier les logs'
                sh """
                curl -X POST https://api.telegram.org/bot<TON_TOKEN>/sendMessage \
                -d chat_id=<TON_CHAT_ID> \
                -d text="❌ *Jenkins Pipeline FAILURE* %0A%0A🔹 *Projet:* ${env.JOB_NAME} %0A🔹 *Build:* #${env.BUILD_NUMBER} %0A🔹 *Attention:* Erreur lors du déploiement ! ⚠️"
                """
            }
        }
        always {
            cleanWs()
        }
    }
}
