import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class PiDocsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Add your infrastructure resources here
    // Example: S3 bucket, CloudFront, RDS, etc.
  }
}

