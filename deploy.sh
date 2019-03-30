#!/usr/bin/env bash

PREFIX=""

if [ "$REVIEW_ID" != "" ]; then
  PREFIX="deploy-preview-$REVIEW_ID--"
fi

CDN_HOST="https://$(echo $PREFIX)amazing-hodgkin-d968dc.netlify.com"

CDN_HOST=$CDN_HOST npm run build:prod
