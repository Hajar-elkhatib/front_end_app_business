Jenkinsfile dial l-Frontend (Angular)
Hada fih l-isla7 dial permission d Docker socket li drna, o scan d Trivy m9add:

Groovy
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
                    sh 'npx sonar-scanner -Dsonar.projectKey=frontend-app -Dsonar.projectName=frontend-app -Dsonar.sources=src'
                }
            }
        }
        
        stage('4. Security Scan (Trivy fs)') {
            steps {
                echo "🔍 Scanning Node modules dependencies..."
                sh 'trivy fs . --severity HIGH,CRITICAL'
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
                sh "trivy image ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} --severity CRITICAL --exit-code 0"
            }
        }
        
        stage('7. Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${REGISTRY_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
        
        stage('8. Deploy avec Ansible') {
            steps {
                sh "ansible-playbook -i ansible/hosts ansible/deploy-frontend.yml --extra-vars 'image_tag=${IMAGE_TAG}'"
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }}