#General utility functions that dont belong in a class

import random
import string
import os

def randomString(min,max):
  return ''.join(random.choice(string.ascii_uppercase+string.ascii_lowercase+
			string.digits+set(' ')) for _ in range(int(random.uniform(min,max))))

def resetMongo():
  os.system('/usr/bin/mongo --eval "db.dropDatabase();" frank-recruiter-system-test')
  os.system('/usr/bin/mongo --eval "db.dropDatabase();" frank-recruiter-system-dev')
