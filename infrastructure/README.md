# Pi Docs Infrastructure

AWS CDK infrastructure code for Pi Docs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Bootstrap CDK (first time only):
```bash
cdk bootstrap
```

3. Synthesize CloudFormation template:
```bash
npm run synth
```

4. Deploy stack:
```bash
npm run deploy
```

## Configuration

Set environment variables:
- `CDK_DEFAULT_ACCOUNT`: Your AWS account ID
- `CDK_DEFAULT_REGION`: AWS region (default: us-east-1)

## Documentation

See `docs/technical/` for detailed infrastructure documentation.

