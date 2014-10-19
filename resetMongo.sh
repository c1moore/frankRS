#!/bin/bash

mongo --eval "db.dropDatabase();" frank-recruiter-system-test

echo "Database has been reset."
