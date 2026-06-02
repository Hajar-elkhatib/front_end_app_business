pipeline {
    agent any

    environment {
<<<<<<< HEAD
        IMAGE_NAME = "my-frontend-app"
        TAG        = "${BUILD_NUMBER}"
=======
        IMAGE = "marouamrouji/frontend-app"
        TAG = "1.0.${env.BUILD_NUMBER}"
>>>>>>> 980012f (admin dashboard integration and frontend updates)
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
<<<<<<< HEAD
                echo 'Analyse du code source Frontend (Angular) avec SonarQube...'
=======
                sh 'npm install'
>>>>>>> 980012f (admin dashboard integration and frontend updates)
            }
        }

        stage('3. Analyse SonarQube') {
            steps {
<<<<<<< HEAD
                echo 'Building Frontend Docker Image...'
                sh "docker build -t ${IMAGE_NAME}:${TAG} ."
=======
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        npx sonar-scanner \
                        -Dsonar.projectKey=frontend-app \
                        -Dsonar.projectName=frontend-app \
                        -Dsonar.sources=src
                    '''
                }
>>>>>>> 980012f (admin dashboard integration and frontend updates)
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

        // 🔥 [إضافة DevSecOps]: سكان أمني حقيقي لـ Image ديال Angular قبل الـ Push
        stage('6. Security Scan: Docker Image (Trivy)') {
            steps {
                echo 'Scanning Frontend Image with Trivy...'
<<<<<<< HEAD
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --severity CRITICAL ${IMAGE_NAME}:${TAG}"
=======
                // كيسكاني الـ Image ويحبس الـ Pipeline يلا لقى ثغرة خطيرة (CRITICAL)
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --severity CRITICAL ${IMAGE}:${TAG}"
>>>>>>> 980012f (admin dashboard integration and frontend updates)
            }
        }

        stage('7. Push Docker Hub') {
            steps {
<<<<<<< HEAD
                script {
                    echo ' Démarrage du déploiement automatique sur Kubernetes (Azure)...'
                    
                   
                    sh 'kubectl apply -f k8s/frontend.yaml'
                    sh 'kubectl apply -f k8s/ia-model.yaml'
                    sh 'kubectl apply -f k8s/backend.yaml' // <--- Le Backend t-zad hna !
                    
                    echo '✅ Frontend, IA et Backend déployés automatiquement avec succès !'
=======
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login -u \$USER --password-stdin"
                    sh "docker push ${IMAGE}:${TAG}"
                    sh "docker push ${IMAGE}:latest"
>>>>>>> 980012f (admin dashboard integration and frontend updates)
                }
            }
        }

        stage('8. Deploy avec Ansible') {
            steps {
                sh 'ssh -o StrictHostKeyChecking=no azureuser@74.161.163.110 "ansible-playbook -i ~/ansible/inventory.ini ~/ansible/deploy.yml"'
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
