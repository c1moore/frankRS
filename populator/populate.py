#!/usr/bin/python3 -B

#Program to prepopulate mongo for integration testing and other purposes by James

from User import User
from Candidate import Candidate
from Event import Event
from Util import resetMongo

import random, time

required = "Entry is invalid. This field is required."

def welcome():
  msg = ("---Welcome to the populator script!---\n" +
	"This program will populate the database for testing and demonstration purposes.\n")
  print(msg)

def getRandomSeed():
  while True:
    try:
      read = int(input("Random seed value (any number, optional, allows repeatability): "))
    except ValueError:
      print("Choosing random seed automatically.")
      return None
    else:
      return read

def getNumAttendees():
  while True:
    try:
      numAttendees = int(input("How many attendees will there be?: "))
      assert (numAttendees >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numAttendees

def getNumRecruiters():
  while True:
    try:
      numRecruiters = int(input("How many recruiters will there be?: "))
      assert (numRecruiters >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numRecruiters

def getNumAdmins():
  while True:
    try:
      numAdmins = int(input("How many admins will there be?: "))
      assert (numAdmins >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numAdmins

def getNumCandidates():
  while True:
    try:
      numCandidates = int(input("How many candidates will there be?: "))
      assert (numCandidates >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numCandidates

def getAdminsUnionRecruiters(numRecruiters,numAdmins):
  while True:
    try:
      unions = int(input(("Of the {} recruiters, how many of them should also be admins? \n" + 
		"(up to {}, or -1 for don't care): ").format(numRecruiters,min(numAdmins,numRecruiters))))
      assert (unions == -1 or (unions>=0 and unions <=min(numAdmins,numRecruiters)))
    except (ValueError, AssertionError):
      print(required)
    else:
      return unions

def getAttendeesUnionRecruiters(numRecruiters,numAttendees):
  while True:
    try:
      unions = int(input(("Of the {} recruiters, how many of them should also be attendees? \n" + 
		"(up to {}, or -1 for don't care): ").format(numRecruiters,min(numRecruiters,numAttendees))))
      assert (unions == -1 or (unions>=0 and unions <=min(numRecruiters,numAttendees)))
    except (ValueError, AssertionError):
      print(required)
    else:
      return unions

def getNumEvents():
  while True:
    try:
      numEvents = int(input("How many events will there be?: "))
      assert (numEvents >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numEvents

def getMaxEventsPerRecruiter(numEvents):
  while True:
    try:
      maxEvents = int(input("How many events (maximum) does a recruiter recruit for?: "))
      assert (maxEvents >= 0 and maxEvents <= numEvents)
    except (ValueError, AssertionError):
      print(required)
    else:
      return maxEvents

def getNumInvitesPerRecruiter():
  while True:
    try:
      numInvites = int(input("How many invites (maximum) should each recruiter send?: "))
      assert (numInvites >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numInvites

def getNumEventsPerCandidate():
  while True:
    try:
      numEvents = int(input("How many events should each candidate apply for?: "))
      assert (numEvents > 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numEvents

def dumpUserSummary(userList):
  with open('user_summary.txt','w') as fd:
    fd.write("User summary:\n")
    for user in userList:
      fd.write("fName: " + user.fName + '\n')
      fd.write("lName: " + user.lName + '\n')
      fd.write("email: " + user.email + '\n')
      fd.write("password: " + user.password + '\n')
      fd.write("roles: " + str(user.roles) + '\n\n')

def main():
  resetMongo("The database has been reset.\n")
  welcome()
  random.seed(a=getRandomSeed())
  numAttendees = getNumAttendees()
  numRecruiters = getNumRecruiters()
  numAdmins = getNumAdmins()
  numCandidates = getNumCandidates()
  numEvents = getNumEvents()
  adminsUnionRecruiters = getAdminsUnionRecruiters(numRecruiters,numAdmins)
  attendeesUnionRecruiters = getAttendeesUnionRecruiters(numRecruiters,numAttendees)
  maxEventsPerRecruiter = getMaxEventsPerRecruiter(numEvents)
  numInvitesPerRecruiter = getNumInvitesPerRecruiter()
  numEventsPerCandidate = getNumEventsPerCandidate()
  if adminsUnionRecruiters==-1:
    adminsUnionRecruiters=random.randint(0,max(numAdmins,numRecruiters))
  if attendeesUnionRecruiters==-1:
    attendeesUnionRecruiters=random.randint(0,max(numRecruiters,numAttendees))
  print("\nGenerating objects (this may take some time)...")
  recruiters = []
  attendees = []
  admins = []
  candidates = []
  events = []
  #Make events
  for i in range(numEvents):
    event = Event()
    event.randomize()
    event.save()
    events.append(event)
  #Make recruiters
  for i in range(numRecruiters):
    newUser = User()
    newUser.randomize()
    newUser.roles = ['recruiter']
    for i in range(random.randint(1,maxEventsPerRecruiter)): #Make them recruit for some events
      newUser.recruitFor(random.choice(events))
    recruiters.append(newUser)
    newUser.save()
  count = 0
  #Make some recruiters attendees
  while count<attendeesUnionRecruiters:
    recruiter = random.choice(recruiters)
    if 'attendee' in recruiter.roles:
      continue
    recruiter.roles.append('attendee')
    attendees.append(recruiter)
    count += 1
  count = 0
  #Make some recruiters admins
  while count<adminsUnionRecruiters:
    recruiter = random.choice(recruiters)
    if 'admin' in recruiter.roles:
      continue
    recruiter.roles.append('admin')
    admins.append(recruiter)
    count += 1
  count = 0
  #Create the remaining attendees
  while len(attendees)<numAttendees:
    newUser = User()
    newUser.randomize()
    newUser.roles = ['attendee']
    attendees.append(newUser)
    newUser.save()
  #Create the remaining admins
  while len(admins)<numAdmins:
    newUser = User()
    newUser.randomize()
    newUser.roles = ['admin']
    admins.append(newUser)
    newUser.save()
  #Create the remaining candidates
  while len(candidates)<numCandidates:
    newUser = Candidate()
    newUser.randomize()
    for i in range(numEventsPerCandidate):
      newUser.addEvent(random.choice(events))
    candidates.append(newUser)
    newUser.save()
  #Recruiters, invite users who are not me
  for recruiter in recruiters:
    recevents = recruiter.getEvents()
    for i in range(random.randint(0,numInvitesPerRecruiter)):
      rec_event_id = random.choice(recevents)
      rec_user = random.choice(attendees)
      while rec_user is recruiter:
        rec_user = random.choice(attendees)
      recruiter.invite(rec_user,rec_event_id)

  dumpUserSummary(list(set(recruiters)|set(attendees)|set(admins)))

  numObjs = len(set(recruiters)|set(attendees)|set(admins)|set(candidates)|set(events))
  print("%s Objects Injected." % numObjs)


if __name__=='__main__':
  main()
