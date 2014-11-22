#!/bin/bash

mongo --eval "db.dropDatabase();" frank-recruiter-system-test > /dev/null
mongo --eval "db.dropDatabase();" frank-recruiter-system-dev > /dev/null

echo "Databases have been reset."
