#!/bin/bash

# Trigger an error if non-zero exit code is encountered
set -e 
exec "$@"
