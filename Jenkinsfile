pipeline {
    agent any

    environment {
        AWS_REGION      = 'us-east-1'
        ECR_REGISTRY    = '211125430491.dkr.ecr.us-east-1.amazonaws.com'
        ECR_REPOSITORY  = 'sani-lite'
        EKS_CLUSTER     = 'sani-lite-cluster-dev'
        K8S_NAMESPACE   = 'sani-lite'
        IMAGE_TAG       = "build-${BUILD_NUMBER}"
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
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {
                    sh '''
                        aws ecr get-login-password --region $AWS_REGION \
                          | docker login --username AWS --password-stdin $ECR_REGISTRY

                        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
                        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

                        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                                   $ECR_REGISTRY/$ECR_REPOSITORY:latest
                        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {
                    sh '''
                        aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION

                        kubectl set image deployment/sani-app \
                          sani-app=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                          -n $K8S_NAMESPACE

                        kubectl rollout status deployment/sani-app \
                          -n $K8S_NAMESPACE --timeout=120s
                    '''
                }
            }
        }
    }

    post {
        success { echo "Deployed $IMAGE_TAG successfully" }
        failure { echo "Pipeline failed — check logs above" }
    }
}
