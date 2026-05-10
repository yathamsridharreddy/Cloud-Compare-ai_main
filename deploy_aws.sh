#!/bin/bash

# Exit on error
set -e

echo "=========================================="
echo " CloudCompare AI - AWS Deployment Script"
echo "=========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    echo "Please install it by following: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured or invalid."
    echo "Please run 'aws configure' first."
    exit 1
fi

# Get current account and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
if [ -z "$AWS_REGION" ]; then
    AWS_REGION="us-east-1"
    echo "⚠️ Region not set in AWS CLI. Defaulting to $AWS_REGION."
fi

echo "✅ Connected to AWS Account: $AWS_ACCOUNT_ID in region: $AWS_REGION"

# Setup ECR
echo "📦 Setting up Amazon ECR Repository..."
aws ecr describe-repositories --repository-names cloudcompare-ai --region $AWS_REGION || \
aws ecr create-repository --repository-name cloudcompare-ai --region $AWS_REGION

# Deploy CloudFormation
echo "☁️ Deploying AWS CloudFormation Stack..."
echo "Please enter a strong Database Password:"
read -s DB_PASSWORD
echo "Please enter a strong JWT Secret (at least 32 characters):"
read -s JWT_SECRET

# Get default VPC and subnets
DEFAULT_VPC=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query "Vpcs[0].VpcId" --output text)
SUBNETS=$(aws ec2 describe-subnets --filters Name=vpc-id,Values=$DEFAULT_VPC --query "Subnets[*].SubnetId" --output text | tr ' ' ',' | cut -d',' -f1,2)

echo "Using Default VPC: $DEFAULT_VPC with Subnets: $SUBNETS"

aws cloudformation deploy \
  --template-file aws-infrastructure.yml \
  --stack-name CloudCompareApp \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    VpcId=$DEFAULT_VPC \
    Subnets=$SUBNETS \
    DBPassword=$DB_PASSWORD \
    JwtSecret=$JWT_SECRET

echo "✅ CloudFormation Deployment Complete!"

# Get ALB URL
ALB_URL=$(aws cloudformation describe-stacks --stack-name CloudCompareApp --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text)
echo "🌐 Your Application Load Balancer URL is: $ALB_URL"

# Setup CodeCommit and Push Code
echo "🚀 Setting up AWS CodeCommit Repository..."
aws codecommit get-repository --repository-name cloudcompare-ai || \
aws codecommit create-repository --repository-name cloudcompare-ai --repository-description "CloudCompare AI Repo"

echo "Pushing code to CodeCommit..."
git remote add aws codecommit://$AWS_REGION/cloudcompare-ai || true
git add .
git commit -m "AWS Deployment" || true
git push aws HEAD:master || git push aws HEAD:main || true

echo "=========================================="
echo "🎉 Deployment Process Triggered Successfully!"
echo "Next Steps: Go to AWS CodePipeline in the console to create a pipeline that links your CodeCommit repository to CodeBuild and ECS."
echo "Your Website will be live at: $ALB_URL"
echo "=========================================="
