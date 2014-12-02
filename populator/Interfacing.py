#Interface code for retrieving information from the user

required = "Entry is invalid. This field is required."

def welcome():
  msg = ("---Welcome to the populator script!---\n" +
	"This program will populate the database for testing and demonstration purposes.\n")
  print(msg)

def ask(msg):
  response = input(msg)
  if (response=="yes" or response=="Yes" or response=="YES" or 
	response=="y" or response=="Y"):
    print("User accepted the demo user (demo@example.com)")
    return True
  else:
    print("User rejected the demo user (demo@example.com)")
    return False

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

def getInjectDemoUser():
  return ask("Inject the demo user?: ")

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
      assert (numAdmins > 0)
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

def getInviteProbability():
  while True:
    try:
      p = float(input("What is the probability that a user accepts an invitation?: "))
      assert (p>=0 and p<=1)
    except (ValueError, AssertionError):
      print(required)
    else:
      return p

def getNumSocialComments():
  while True:
    try:
      numSocialComments = int(input("How many comments to create for the social stream?: "))
      assert (numSocialComments >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numSocialComments

def getNumRecruiterComments():
  while True:
    try:
      numRecruiterComments = int(input("How many comments to create for the recruiter stream?: "))
      assert (numRecruiterComments >= 0)
    except (ValueError, AssertionError):
      print(required)
    else:
      return numRecruiterComments

def dumpUserSummary(userList):
  with open('user_summary.txt','w') as fd:
    fd.write("User summary:\n\n")
    for user in userList:
      fd.write("fName: " + user.fName + '\n')
      fd.write("lName: " + user.lName + '\n')
      fd.write("email: " + user.email + '\n')
      fd.write("password: " + user._password + '\n')
      fd.write("roles: " + str(user.roles) + '\n\n')
