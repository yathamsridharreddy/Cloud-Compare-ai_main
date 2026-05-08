pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "cloudcompare-ai"
        DOCKER_REGISTRY = "raghavendra2006"
        // Credentials IDs - ensure these exist in Jenkins
        SONAR_CRED_ID = 'sonar-token'
        DOCKER_CRED_ID = 'docker-hub-creds'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Build Jar') {
            steps {
                // Use bat for Windows Jenkins or sh for Linux
                script {
                    if (isUnix()) {
                        sh './mvnw clean package -DskipTests'
                    } else {
                        bat 'mvnw.cmd clean package -DskipTests'
                    }
                }
            }
        }

        stage('Sonar Analysis') {
            steps {
                withCredentials([string(credentialsId: SONAR_CRED_ID, variable: 'SONAR_TOKEN')]) {
                    script {
                        def sonarCmd = "mvn sonar:sonar -Dsonar.projectKey=cloud-compare-ai -Dsonar.login=${SONAR_TOKEN}"
                        if (isUnix()) {
                            sh sonarCmd
                        } else {
                            bat sonarCmd
                        }
                    }
                }
            }
        }

        stage('Docker Build & Tag') {
            steps {
                script {
                    def tag = "${env.BUILD_NUMBER}"
                    sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${tag} ."
                    sh "docker tag ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${tag} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying version ${env.BUILD_NUMBER}..."
            }
        }
    }

    post {
        success {
            echo 'Build and Deployment Successful!'
        }
        failure {
            echo 'Build Failed. Please check the logs above.'
        }
        cleanup {
            // Safer way to clean workspace
            deleteDir()
        }
    }
}
