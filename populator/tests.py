#!/usr/bin/python3 -B

from Candidate import Candidate
from Event import Event
from User import User
from Util import resetMongo

#This script attempts to test the functionality that will be needed for the populator
#It DOES NOT verify that the data is actually in the database the purpose is to ensure
#	that the results are relatively sane and at least runnable from python's
#	point of view

def main():

  print("Attempting to reset MongoDB")
  resetMongo()

  print("\nTesting dependencies\n")

  try:
    import pymongo
  except Exception as e:
    print("--FAILED to import pymongo. Dependencies not satisfied?")
    raise e
  else:
    print("--SUCCESS when importing pymongo")

  try:
    import pbkdf2
  except Exception as e:
    print("--FAILED to import pbkdf2. Dependencies not satisfied?")
    raise e
  else:
    print("--SUCCESS when importing pbkdf2")


  print("\nTesting User object functionality\n")

  try:
    user = User()
  except Exception as e:
    print("--FAILED to instantiate new user")
    raise e
  else:
    print("--SUCCESS when instantiating a new user")

  try:
    user.randomize()
  except Exception as e:
    print("--FAILED to randomize a User object")
    raise e
  else:
    print("--SUCCESS when randomizing a User object")

  try:
    assert(user.valid())
  except Exception as e:
    print("--FAILED to verify validity of user object")
    raise e
  else:
    print("--SUCCESS when verifying validity of user object")

  try:
    user.save() #Eek!
  except Exception as e:
    print("--FAILED to save a user object")
    raise e
  else:
    print("--SUCCESS when saving a user object")

  print("\nTesting Event object functionality\n")

  try:
    event = Event()
  except Exception as e:
    print("--FAILED to instantiate new event")
    raise e
  else:
    print("--SUCCESS in instantiating new event")

  try:
    event.randomize()
  except Exception as e:
    print("--FAILED to randomize event object")
    raise e
  else:
    print("--SUCCESS in randomizing event object")

  try:
    event.save()
  except Exception as e:
    print("--FAILED to save event object")
    raise e
  else:
    print("--SUCCESS in saving event object")

  print("\nTesting Candidate object functionality\n")

  try:
    candidate = Candidate()
  except Exception as e:
    print("--FAILED to instantiate new candidate object")
    raise e
  else:
    print("--SUCCESS in instantiating new candidate object")

  try:
    candidate.randomize()
  except Exception as e:
    print("--FAILED to randomize candidate object")
    raise e
  else:
    print("--SUCCESS in randomizing candidate object")

  try:
    candidate.save()
  except Exception as e:
    print("--FAILED to save candidate object")
    raise e
  else:
    print("--SUCCESS in saving candidate object")

  try:
    candidate.fName = "SomethingElse"
    candidate.save()
  except Exception as e:
    print("--FAILED to update candidate in database")
    raise e
  else:
    print("--SUCCESS in updating candidate in database")

  print("\nIntegration testing\n")

  try:
    user.roles.append('recruiter')
    user.save()
    user2 = User()
    user2.randomize()
    user.invite(user2,event)
  except Exception as e:
    print("--FAILED to invite a user")
    raise e
  else:
    print("--SUCCESS in inviting a user")

  try:
    user2.decide(event._id,True,False,user)
  except Exception as e:
    print("--FAILED user accept an invitation")
    raise e
  else:
    print("--SUCCESS user accept an invitation")

  print("\nDone with no errors! Resetting databases...\n")
  resetMongo()

if __name__=='__main__':
  main()


