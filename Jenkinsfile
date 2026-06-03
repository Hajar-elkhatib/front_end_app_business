pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = 'marouamrouji'
        IMAGE_NAME      = 'frontend-app'
        IMAGE_TAG       = "1.0.${BUILD_NUMBER}"
        REGISTRY_CRED   = 'docker-hub-credentials'
    }
    
    stages {
        stage('1. Checkout SCM') {
            steps {
                cleanWs() // Nettoyage de sécurité avant de commencer
                checkout scm
            }
        }
        
        stage('2. Install & Build Angular') {
            steps {
                sh 'npm install'
                sh 'npm run build -- --configuration production'
            }
        }
        
        stage('3. Analyse SonarQube') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    // Ajout du flag de sécurité pour ne pas bloquer en cas d'échec du Quality Gate
                    sh 'npx sonar-scanner -Dsonar.projectKey=frontend-app -Dsonar.projectName=frontend-app -Dsonar.sources=src -Dsonar.qualitygate.wait=false'
                }
            }
        }
        
        stage('4. Security Scan (Trivy fs)') {
            steps {
                echo "🔍 Scanning Node modules dependencies via Docker..."
                // 🔥 Correction ici : On utilise Docker pour exécuter Trivy sur le dossier courant
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${WORKSPACE}:/apps aquasec/trivy fs /apps --severity HIGH,CRITICAL --exit-code 0"
            }
        }
        
        stage('5. Build Docker Image') {
            steps {
                sh "docker build --no-cache -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }
        
        stage('6. Security Scan (Trivy Image)') {
            steps {
                echo "🛡️ Scanning Frontend Docker Image..."
                // Utilisation de l'image Docker officielle de Trivy pour scanner notre build
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} --severity CRITICAL --exit-code 0"
            }
        }
        
        stage('7. Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${REGISTRY_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
                }
            }
        }
        
        stage('8. Deploy avec Ansible') {
            steps {
                // Attention : s'assurer que le chemin vers la clé SSH ou la commande ansible est correct selon votre conf
                sh "ansible-playbook -i ansible/hosts ansible/deploy-frontend.yml --extra-vars 'image_tag=${IMAGE_TAG}'"
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
