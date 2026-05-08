pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "cloudcompare-ai"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = "raghavendra2006" // Change this to your Docker Hub username
        SONAR_TOKEN = credentials('sonar-token')
        DOCKER_HUB_CREDS = credentials('docker-hub-creds')
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Build Jar') {
            steps {
                sh './mvnw clean package -DskipTests'
            }
        }

        stage('Sonar Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'mvn sonar:sonar \
                        -Dsonar.projectKey=cloud-compare-ai \
                        -Dsonar.login=${SONAR_TOKEN}'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"
            }
        }

        stage('Docker Login') {
            steps {
                sh "echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin"
            }
        }

        stage('Docker Push') {
            steps {
                sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to target environment...'
                // Add your deployment logic here, e.g., ssh to EC2 and docker pull/run
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs.'
        }
    }
}
