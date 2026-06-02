pipeline {
    agent any

    environment {
        IMAGE_NAME = "my-frontend-app"
        TAG        = "${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('2. Security Scan: SAST (SonarQube)') {
            steps {
                echo 'Analyse du code source Frontend (Angular) avec SonarQube...'
            }
        }

        stage('3. Build Docker Image') {
            steps {
                echo 'Building Frontend Docker Image...'
                sh "docker build -t ${IMAGE_NAME}:${TAG} ."
            }
        }

        stage('4. Security Scan: Docker Image (Trivy)') {
            steps {
                echo 'Scanning Frontend Image with Trivy...'
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --severity CRITICAL ${IMAGE_NAME}:${TAG}"
            }
        }

        stage('5. Deploy Frontend to Azure (MicroK8s)') {
            steps {
                script {
                    echo ' Démarrage du déploiement automatique sur Kubernetes (Azure)...'
                    
                   
                    sh 'kubectl apply -f k8s/frontend.yaml'
                    sh 'kubectl apply -f k8s/ia-model.yaml'
                    sh 'kubectl apply -f k8s/backend.yaml' // <--- Le Backend t-zad hna !
                    
                    echo '✅ Frontend, IA et Backend déployés automatiquement avec succès !'
                }
            }
        }
    }

    post {
        success {
            script {
                sh """
                curl -X POST https://api.telegram.org/bot<TON_TOKEN>/sendMessage \
                -d chat_id=<TON_CHAT_ID> \
                -d text="🚀 *Jenkins Pipeline SUCCESS* %0A%0A🔹 *Projet:* ${env.JOB_NAME} %0A🔹 *Build:* #${env.BUILD_NUMBER} %0A🔹 *Statut:* Tout l'écosystème (Front, Backend, IA) est déployé sur Azure ! 🎉"
                """
            }
        }
        failure {
            script {
                sh """
                curl -X POST https://api.telegram.org/bot<TON_TOKEN>/sendMessage \
                -d chat_id=<TON_CHAT_ID> \
                -d text="❌ *Jenkins Pipeline FAILURE* %0A%0A🔹 *Projet:* ${env.JOB_NAME} %0A🔹 *Build:* #${env.BUILD_NUMBER} %0A🔹 *Attention:* Erreur lors du déploiement ou blocage de sécurité Trivy ! ⚠️"
                """
            }
        }
    }
}
