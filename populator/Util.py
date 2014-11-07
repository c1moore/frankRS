#General utility functions that dont belong in a class

import pymongo

import random
import string
import os

TWENTY_YEARS = 631138519494
THIRTY_YEARS = 946707779241
MONGO_PATH = '/usr/bin/mongo'
DATABASE = "frank-recruiter-system-dev"
WEBS = ('.com','.org','.nz','.biz','.gov','.cc')
PymongoDB = None

def randomString(min,max,extras=""):
  return ''.join(random.choice(list(set(string.ascii_uppercase+string.ascii_lowercase+
			string.digits)|set(extras))) for _ in range(random.randint(min,max)))

def randomTimeInMS(minimum=TWENTY_YEARS):
  return random.randint(minimum,minimum+THIRTY_YEARS)

def ensureID(refObj):
  if hasattr(refObj,'_id'):
    return refObj._id
  else:
    refObj.save()
    return refObj._id

def resetMongo():
  os.system('{} --eval "db.dropDatabase();" frank-recruiter-system-test'.format(MONGO_PATH))
  os.system('{} --eval "db.dropDatabase();" {}'.format(MONGO_PATH,DATABASE))

def getPymongoDB():
  global PymongoDB
  if not PymongoDB:
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    PymongoDB = client[DATABASE]
  return PymongoDB


