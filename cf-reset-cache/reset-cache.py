#!/usr/local/bin/python

import boto
import os
import sys


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
s3_conn = boto.connect_s3(access_key, access_secret)
docs = s3_conn.get_bucket(bucket)
items = []

for key in docs.list():
    index_file = "/index.html"
    if key.name.endswith((index_file)):
        # append the file without the postfix as well
        items.append(key.name.replace(index_file, ""))
        items.append(key.name.replace(index_file, "/"))
    items.append(key.name)

cf_conn = boto.connect_cloudfront(access_key, access_secret)
inval_req = cf_conn.create_invalidation_request(cloudfront_dist, items)

print "Invalidating these files: "
print items

print inval_req
sys.exit(0)
