pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = 'your-dockerhub-username/sani-lite'
        IMAGE_TAG      = "build-${BUILD_NUMBER}"
    }

    stages {

        stage('Test') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install --frozen-lockfile'
                sh 'pnpm test'
            }
        }

        stage('Build & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        docker build -t $DOCKERHUB_REPO:$IMAGE_TAG .
                        docker push $DOCKERHUB_REPO:$IMAGE_TAG

                        docker tag $DOCKERHUB_REPO:$IMAGE_TAG $DOCKERHUB_REPO:latest
                        docker push $DOCKERHUB_REPO:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh-key',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$EC2_HOST "
                            docker pull $DOCKERHUB_REPO:$IMAGE_TAG

                            docker rm -f sani-app 2>/dev/null || true

                            docker run -d --name sani-app --restart unless-stopped \
                              -p 3000:3000 \
                              -e DATABASE_URL=$DATABASE_URL \
                              -e JWT_SECRET=$JWT_SECRET \
                              -e NODE_ENV=production \
                              -e PORT=3000 \
                              $DOCKERHUB_REPO:$IMAGE_TAG
                        "
                    '''
                }
            }
        }
    }

    post {
        success { echo "Deployed $IMAGE_TAG to EC2 successfully" }
        failure { echo "Pipeline failed — check logs above" }
    }
}
