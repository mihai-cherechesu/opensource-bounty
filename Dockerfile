FROM python:3.11

RUN apt-get update && apt-get install -y \
  libncurses5

RUN pip3 install --upgrade --no-cache-dir multiversx-sdk-cli
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
