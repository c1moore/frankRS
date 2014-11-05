#General utility functions that dont belong in a class

import pymongo

import random
import string
import os

TWENTY_YEARS = 631138519494
THIRTY_YEARS = 946707779241
MONGO_PATH = '/usr/bin/mongo'
DATABASE = "frank-recruiter-system-dev"
WEBS = ('.com','.org','.nz','.biz')
PymongoDB = None

def randomString(min,max):
  return ''.join(random.choice(string.ascii_uppercase+string.ascii_lowercase+
			string.digits+set(' ')) for _ in range(int(random.uniform(min,max))))

def randomTimeInMS(mininum=TWENTY_YEARS):
  return random.randint(mininum,mininum+THIRTY_YEARS)

def resetMongo():
  os.system('{} --eval "db.dropDatabase();" frank-recruiter-system-test'.format(MONGO_PATH))
  os.system('{} --eval "db.dropDatabase();" {}'.format(MONGO_PATH,DATABASE))

def getPymongoDB():
  if not PymongoDB:
    client = pymongo.MongoClient('mongod://localhost:27017/')
    PymongoDB = client[DATABASE]
  return PymongoDB


