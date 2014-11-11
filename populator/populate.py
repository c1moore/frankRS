#!/usr/bin/python3

#Program to prepopulate mongo for integration testing and other purposes by James

#TODO: Recruiters must invite some of the attendees. How to parameterize?

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

def getNumEvents():
  while True:
    try:
      numEvents = int(input("How many events will there be?: "))
    except ValueError:
      print(required)
    else:
      return numEvents

def getMaxEventsPerRecruiter():
  while True:
    try:
      maxEvents = int(input("How many events (maximum) does a recruiter recruit for?: "))
    except ValueError:
      print(required)
    else:
      return maxEvents


def main():
  welcome()
  random.seed(a=getRandomSeed())
  numAttendees = getNumAttendees()
  numRecruiters = getNumRecruiters()
  numAdmins = getNumAdmins()
  numCandidates = getNumCandidates()
  numEvents = getNumEvents()
  adminsUnionRecruiters = getAdminsUnionRecruiters(numRecruiters,numAdmins)
  attendeesUnionRecruiters(numRecruiters,numAdmins)
  maxEventsPerRecruiter = getMaxEventsPerRecruiter()
  if adminsUnionRecruiters==-1:
    adminsUnionRecruiters=random.randint(0,max(numAdmins,numRecruiters))
  if attendeesUnionRecruiters==-1:
    attendeesUnionRecruiters=random.randint(0,max(numRecruiters,numAttendees))
  print("Generating objects...")
  time.sleep(3) #Take a deep breath!
  recruiters = set()
  attendees = set()
  admins = set()
  candidates = set()
  events = set()
  for i in range(numEvents):
    event = Event()
    event.randomize()
    event.save()
    events.add(event)
  for i in range(numRecruiters):
    newUser = User()
    newUser.randomize()
    newUser.roles = ['recruiter']
    for i in range(random.randint(0,maxEventsPerRecruiter)):
      newUser.recruitFor(random.choice(events))
    recruiters.add(newUser)
    newUser.save()
  count = 0
  while count<attendeesUnionRecruiters:
    recruiter = random.choice(recruiters)
    if recruiter.roles.contains('attendee'):
      continue
    recruiter.roles.append('attendee')
    attendees.add(recruiter)
    count += 1
  count = 0
  while count<adminsUnionRecruiters:
    recruiter = random.choice(recruiters)
    if recruiter.roles.contains('admin'):
      continue
    recruiter.roles.append('admin')
    admins.add(recruiter)
    count += 1
  count = 0
  while len(attendees)<numAttendees:
    newUser = User()
    newUser.randomize()
    newUser.roles = ['attendee']
    attendees.add(newUser)
  while len(admins)<numAdmins:
    newUser = User()
    newUser.randomize()
    newUser.roles = ['admin']
    admins.add(newUser)
  while len(candidates)<numCandidates:
    newUser = User()
    newUser.randomize()
    newUser.roles = [] #No special roles by default


if __name__=='__main__':
  main()
