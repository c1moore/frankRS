#!/usr/bin/python3

#Script to prepopulate mongo for integration testing and other purposes by James

import random
import string
import os

class Struct:
  pass

def resetMongo():
  os.system('/usr/bin/mongo --eval "db.dropDatabase();" frank-recruiter-system-test')
  os.system('/usr/bin/mongo --eval "db.dropDatabase();" frank-recruiter-system-dev')

def randomString(min,max):
  return ''.join(random.choice(string.ascii_uppercase+string.ascii_lowercase+
			string.digits+set(' ')) for _ in range(int(random.uniform(min,max))))

def genEvent():
  event = Struct()
  event.name = randomString(3,20)
  event.schedule = 'www.' + randomString(6,12) + '.com'
  event.location = randomString(2,10)
  
