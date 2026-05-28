pipeline {
    agent any

    environment {
        // 🚨 Nom de l'image Docker pour le Frontend
        IMAGE_NAME = "my-frontend-app"
        TAG        = "${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                // Récupère automatiquement la dernière version du code depuis Git
                checkout scm
            }
        }

        stage('2. Security Scan: SAST (SonarQube)') {
            steps {
                echo 'Analyse du code source Frontend (Angular) avec SonarQube...'
                // Si votre SonarQube est déjà configuré dans Jenkins, tu peux décommenter la ligne suivante :
                // withSonarQubeEnv('SonarQube') { sh 'sonar-scanner' }
            }
        }

        stage('3. Build Docker Image') {
            steps {
                echo 'Building Frontend Docker Image...'
                // Cette commande construit l'image en lisant ton Dockerfile
                sh "docker build -t ${IMAGE_NAME}:${TAG} ."
            }
        }

        stage('4. Security Scan: Docker Image (Trivy)') {
            steps {
                echo 'Scanning Frontend Image with Trivy...'
                // Trivy scanne l'image et bloque le pipeline (exit-code 1) si une faille CRITICAL est trouvée
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --severity CRITICAL ${IMAGE_NAME}:${TAG}"
            }
        }

        stage('5. Deploy Frontend to Azure (MicroK8s)') {
            steps {
                echo 'Deploying Frontend Service to Azure...'
                // Quand tu seras prête pour le déploiement réel, tu pourras décommenter cette ligne :
                // sh "kubectl apply -f k8s/frontend-deployment.yaml"
            }
        }
    }
}