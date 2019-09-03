#!/usr/local/bin/python

import boto3
import os
import sys
import uuid


access_key = os.getenv("AWS_ACCESS_KEY")
access_secret = os.getenv("AWS_SECRET_KEY")
cloudfront_dist = os.getenv("AWS_CF_DISTRIBUTION_ID")
bucket = os.getenv("AWS_S3_BUCKET")

if access_key == "" or access_key is None:
    print "Please set AWS_ACCESS_KEY env variable."
    sys.exit(1)
elif access_secret == "" or access_secret is None:
    print "Please set AWS_SECRET_KEY env variable."
    sys.exit(1)
elif cloudfront_dist == "" or cloudfront_dist is None:
    print "Please set AWS_CF_DISTRIBUTION_ID env variable."
    sys.exit(1)
elif bucket == "" or bucket is None:
    print "Please set AWS_S3_BUCKET env variable."
    sys.exit(1)

# get the paths from s3
s3_conn = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=access_secret)
docs = s3_conn.list_objects(Bucket=bucket)
items = []

for key in docs['Contents']:
    name = key['Key'].encode('utf-8')
    index_file = "index.html"
    if name.endswith((index_file)):
        # append the file without the postfix as well
        items.append(name.replace(index_file, "/"))
    items.append('/{}'.format(name))

cf_conn = boto3.client('cloudfront', aws_access_key_id=access_key, aws_secret_access_key=access_secret)
inval_req = cf_conn.create_invalidation(
    DistributionId=cloudfront_dist,
    InvalidationBatch={
        'Paths': {
            'Quantity': len(items),
            'Items': items,
        },
        'CallerReference': str(uuid.uuid4())
    }
)

print "Invalidating these files: "
print items

print inval_req
sys.exit(0)
