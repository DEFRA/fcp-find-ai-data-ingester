ARG IMAGE_TAG=1.0.0

FROM {{adpSharedAcrName}}.azurecr.io/image/adp-aisearch-deploy:$IMAGE_TAG

COPY --chmod=755 aisearch ./aisearch

CMD ["-Command","deploy", "aisearch", "fcp-find-ai-data-ingester"]