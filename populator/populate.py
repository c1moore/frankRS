#!/usr/bin/python3

#Program to prepopulate mongo for integration testing and other purposes by James

from User import User
from Candidate import Candidate
from Attendee import Attendee
from Event import Event
from Util import resetMongo

import random

def getRandomSeed():
  read = input("Random seed value (any interger number, press enter to skip): ")
  if not read:
    return random.randint(0,2**31-1)
  else:
    return int(read)

def getNumAttendees():
  return int(input("How many attendees will there be?: "))

def getNumRecruiters():
  return int(input("How many recruiters will there be?: "))

def getNumAdmins():
  return int(input("How many admins will there be?: "))

def getNumCandidates():
  return int(input("How many candidates will there be?: "))

def getAdminsUnionRecruiters(numRecruiters,numAdmins):
  return int(input(("Of the {} recruiters, how many of them should also be admins? \n" + 
		"(up to {}, or -1 for don't care): ").format(numRecruiters,max(numAdmins,numRecruiters))))

def getAttendeesUnionRecruiters(numRecruiters,numAttendees):
  return int(input(("Of the {} recruiters, how many of them should also be attendees? \n" + 
		"(up to {}, or -1 for don't care): ").format(numRecruiters,max(numRecruiters,numAttendees))))

def main():
  random.seed(a=getRandomSeed())
  numAttendees = getNumAttendees()
  numRecruiters = getNumRecruiters()
  numAdmins = getNumAdmins()
  numCandidates = getNumCandidates()
  adminsUnionRecruiters = getAdminsUnionRecruiters(numRecruiters,numAdmins)
  attendeesUnionRecruiters(numRecruiters,numAdmins)
  if adminsUnionRecruiters==-1:
    adminsUnionRecruiters=random.randint(0,max(numAdmins,numRecruiters))
  if attendeesUnionRecruiters==-1:
    attendeesUnionRecruiters=random.randint(0,


if __name__=='__main__':
  print("I'm main!")
  main()
