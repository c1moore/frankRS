#!/usr/bin/python3

#Program to prepopulate mongo for integration testing and other purposes by James

from User import User
from Candidate import Candidate
from Attendee import Attendee
from Event import Event
from Util import resetMongo

import random, time

required = "You must specify an interger. This field is required."

def welcome():
  msg = ("---Welcome to the populator script!---\n" +
	"This program will populate the database for testing and demonstration purposes.\n")
  print(msg)

def getRandomSeed():
  read = input("Random seed value (any number, optional, allows repeatability): ")
  if not read:
    return time.time()
  else:
    return int(read)

def getNumAttendees():
  while True:
    try:
      numAttendees = int(input("How many attendees will there be?: "))
    except ValueError:
      print(required)
    else:
      return numAttendees

def getNumRecruiters():
  while True:
    try:
      numRecruiters = int(input("How many recruiters will there be?: "))
    except ValueError:
      print(required)
    else:
      return numRecruiters

def getNumAdmins():
  while True:
    try:
      numAdmins = int(input("How many admins will there be?: "))
    except ValueError:
      print(required)
    else:
      return numAdmins

def getNumCandidates():
  while True:
    try:
      numCandidates = int(input("How many candidates will there be?: "))
    except ValueError:
      print(required)
    else:
      return numCandidates

def getAdminsUnionRecruiters(numRecruiters,numAdmins):
  while True:
    try:
      unions = int(input(("Of the {} recruiters, how many of them should also be admins? \n" + 
		"(up to {}, or -1 for don't care): ").format(numRecruiters,max(numAdmins,numRecruiters))))
    except ValueError:
      print(required)
    else:
      return unions

def getAttendeesUnionRecruiters(numRecruiters,numAttendees):
  while True:
    try:
      union = int(input(("Of the {} recruiters, how many of them should also be attendees? \n" + 
		"(up to {}, or -1 for don't care): ").format(numRecruiters,max(numRecruiters,numAttendees))))
    except ValueError:
      print(required)
    else:
      return union

def main():
  welcome()
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
    attendeesUnionRecruiters=random.randint(0,max(numRecruiters,numAttendees))


if __name__=='__main__':
  main()
