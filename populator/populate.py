#!/usr/bin/python3 -B

#Program to prepopulate mongo for integration testing and other purposes by James

from User import User
from Candidate import Candidate
from Event import Event
from Comment import Comment
from Util import resetMongo, ensureID
from Interfacing import *

import random, time

def getForThisEvent(attendeeList,eventID):
  eventID = ensureID(eventID)
  attendees = []
  events = [item['event_id'] for item in attendeeList]
  users = [item['user_id'] for item in attendeeList]
  for i in range(len(events)):
    if events[i] == eventID:
      attendees.append(users[i])
  return attendees

def injectDemoUser():
  demo = User()
  demo.randomize()
  demo.roles = ['admin','recruiter','attendee']
  demo.email = "demo@example.com"
  demo.fName = "Alin"
  demo.lName = "Dobra"
  demo.displayName = demo.lName + ', ' + demo.fName
  demo.organization = "University of Florida"
  demo.save()
  return demo

def injectTestCandidates():
  c0 = Candidate()
  c1 = Candidate()
  c2 = Candidate()
  c0.randomize()
  c1.randomize()
  c2.randomize()
  c0.email = 'demo@example.com'
  c1.email = 'testCandidate1@example.com'
  c2.email = 'testCandidate2@example.com'
  c0.fName += '_ctest'
  c1.fName += '_ctest'
  c2.fName += '_ctest'
  c0.lName += '_ctest'
  c1.lName += '_ctest'
  c2.lName += '_ctest'
  c0.save()
  c1.save()
  c2.save()
  return (c0,c1,c2)

def injectDemoEventFor(demo,c0,c1,c2):
  event = Event()
  event.randomize()
  event.name = "Project Demonstration"
  event.location = "CSE Building"
  demo.recruitFor(event)
  c0.addEvent(event)
  c1.addEvent(event)
  c2.addEvent(event)
  event.save() #Redundant, but I want to save it again
  return event

def main():
  resetMongo("The database (dev) has been reset.\n")
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
  numSocialComments = getNumSocialComments()
  numRecruiterComments = getNumRecruiterComments()
  p = getInviteProbability()
  if adminsUnionRecruiters==-1:
    adminsUnionRecruiters=random.randint(0,min(numAdmins,numRecruiters))
  if attendeesUnionRecruiters==-1:
    attendeesUnionRecruiters=random.randint(0,min(numRecruiters,numAttendees))
  recruiters = []
  attendees = [] #By role
  admins = []
  candidates = []
  events = []
  comments = []
  usingTestUsers = getInjectTestUsers()
  if usingTestUsers:
    demo = injectDemoUser()
    recruiters.append(demo)
    attendees.append(demo)
    c0,c1,c2 = injectTestCandidates()
    admins.append(demo)
    demoEvent = injectDemoEventFor(demo,c0,c1,c2)
    events.append(demoEvent)
    candidates.append(c0)
    candidates.append(c1)
    candidates.append(c2)
    print("User accepted the demo user (demo@example.com)")
    [print("User accepted test candidate %s" % c.email) for c in candidates]
  print("\nGenerating objects (this may take some time)...")
  #Make events
  for i in range(numEvents):
    event = Event()
    event.randomize()
    event.save()
    events.append(event)
  if usingTestUsers:
    if len(events)==0:
      raise RuntimeError("No events exist to add to the demo user--Demo must have events!")
    demoEvents = random.sample(events,random.randint(1,maxEventsPerRecruiter))
    for event in demoEvents:
      demo.recruitFor(event)    
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
  preAttendees = 0
  for recruiter in recruiters:
    if 'attendee' in recruiter.roles:
      attendees.append(recruiter)
      preAttendees += 1
  while (count+preAttendees)<attendeesUnionRecruiters:
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
  invitations = []
  for recruiter in recruiters:
    recevents = recruiter.getEvents()
    for i in range(random.randint(0,numInvitesPerRecruiter)):
      rec_event_id = random.choice(recevents)
      rec_user = random.choice(attendees)
      while rec_user is recruiter:
        rec_user = random.choice(attendees)
      read = random.choice([True,False])
      if recruiter.invite(rec_user,rec_event_id,read):
        invitations.append((rec_user,rec_event_id,recruiter,read))
  #Users, accept invitations
  for invitee,event,recruiter,read in invitations:
    invitee.decide(event,random.random()<p,'recruiter' in invitee.roles,read,recruiter)
  #Attach ranks
  eventBins = [[]]
  eventOrder = []
  insertionPoint = 0
  for event in events:
    eventOrder.append(ensureID(event))
    for recruiter in recruiters:
      assert 'recruiter' in recruiter.roles, "Bug! Recruiter does not have the proper role!"
      for statusDict in recruiter.status:
        eventID = statusDict['event_id']
        if ensureID(eventID) == ensureID(event) and statusDict['recruiter'] == True:
          eventBins[insertionPoint].append(recruiter)
    insertionPoint += 1
    eventBins.append([])
  eventBins.pop()
  for bin in eventBins:
    e = eventOrder[eventBins.index(bin)]
    sortedBin = sorted(bin,key=lambda r:-(len(getForThisEvent(
	r.attendeeList,e))*1000000+len(getForThisEvent(r.inviteeList,e))))
    assert len(list(set(bin)))==len(bin)
    for i in range(len(sortedBin)):
      sortedBin[i].rank.append({'event_id':eventOrder[eventBins.index(bin)],'place':i+1})
      sortedBin[i].save()
  #Social comment stream
  while len(comments) < numSocialComments:
    user = random.choice(list(set(recruiters)|set(attendees)|set(admins)))
    if 'admin' in user.roles:
      event = random.choice(events)
    else:
      userEvents = user.getEvents()
      if not userEvents: continue
      event = random.choice(userEvents)
    comments.append(Comment(ensureID(user),ensureID(event),comment=None,interests=None,
			date=None,stream='social'))
  #Recruiter comment stream
  while len(comments)-numSocialComments < numRecruiterComments:
    recruiterOrAdmin = random.choice(list(set(recruiters)|set(admins)))
    if 'admin' in recruiterOrAdmin.roles:
      event = random.choice(events)
    else:
      userEvents = recruiterOrAdmin.getEvents()
      if not userEvents: continue
      event = random.choice(userEvents)
    comments.append(Comment(ensureID(recruiterOrAdmin),ensureID(event),comment=None,interests=None,
			date=None,stream='recruiter'))
  [comment.save() for comment in comments]
    
  dumpUserSummary(list(set(recruiters)|set(attendees)|set(admins)))

  print("Objects Injected.")


if __name__=='__main__':
  main()
