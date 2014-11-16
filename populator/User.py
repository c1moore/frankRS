#User object

from Util import randomString, randomNameString, randomBytes
from Util import WEBS
from Util import getPymongoDB
from Util import randomTimeInMS
from Util import ensureID

import random
import inspect
import calendar
from datetime import datetime
from datetime import date as Date
from time import mktime
from base64 import b64encode
from pbkdf2 import PBKDF2

ROLES = ['admin', 'recruiter', 'attendee']

def makeTemplates(min,max):
  result = []
  for i in range(0,random.randint(min,max)):
    result.append({'name':randomString(2,12,' '),'template':randomString(0,500,' ')})
  return result

class User:

  def __init__(self):
    pass

  def randomize(self):
    self.fName = randomNameString(2,16).capitalize()
    self.lName = randomNameString(2,16).capitalize()
    self.displayName = randomString(2,16,' ')
    self.email = (randomString(4,35).lower()+'@'+randomString(4,35)+
			random.choice(WEBS))
    self.salt = str(b64encode(randomBytes(16)))[2:-2]
    self._password = randomString(6,64,"""~!@#$%^&*(")[]{}|\;:<>,.""")
    self.password = str(PBKDF2(self._password,self.salt,
			iterations=10000).hexread(64))
    self.provider = "local"
    self.roles = [random.choice(ROLES)]
    cday = random.randint(1,28)
    cmonth = random.randint(1,12)
    cyear = random.randint(1970,Date.today().year)
    self.created = datetime.combine(Date(cyear,cmonth,cday),datetime.min.time())
    uyear = random.randint(cyear,Date.today().year+1000)
    if uyear==cyear:
      umonth = random.randint(cmonth,12)
    else:
      umonth = random.randint(1,12)
    if umonth==cmonth and uyear==cyear:
      uday = random.randint(cday,28)
    else:
      uday = random.randint(1,28)
    self.updated = datetime.combine(Date(uyear,umonth,uday),datetime.min.time())
    self.status = [] #Might have to adjust because it's a schema
    self.inviteeList = []
    self.attendeeList = []
    self.almostList = []
    self.rank = []
    self.login_enabled = True
    self.templates = makeTemplates(0,5)

  def decide(self,eventID,attending,recruiting,recruiter=None):
    eventID = ensureID(eventID)
    statdict = {'event_id':eventID,'attending':attending,'recruiter':recruiting}
    self.status.append(statdict)
    self.save()
    if attending and recruiter:
      attendeedict = {'user_id':self._id,'event_id':eventID}
      recruiter.attendeeList.append(attendeedict)
      recruiter.inviteeList.remove(attendeedict)
      recruiter.save()
      db = getPymongoDB()
      Users = db.users
      recWhoInvitedMe = Users.find({'inviteeList': {'user_id': self._id,'event_id':eventID}})
      for rec in recWhoInvitedMe:
        if rec['_id'] is not recruiter._id:
          rec['almostList'].append({'user_id':self._id,'event_id':eventID})
          rec['inviteeList'].remove({'user_id':self._id,'event_id':eventID})
          Users.save(rec)

  def invite(self,userID,eventID):
    userID = ensureID(userID)
    eventID = ensureID(eventID)
    inviteedict = {'user_id':userID,'event_id':eventID}
    if inviteedict in self.inviteeList:
      return
    self.inviteeList.append(inviteedict)
    self.save()

  def recruitFor(self,eventID):
    eventID = ensureID(eventID)
    if not 'recruiter' in self.roles:
      raise RuntimeError("User: Cant recruit unless recruiter")
    self.status.append({'event_id':eventID,'attending':random.choice([True,False]),'recruiter':True})

  def getEvents(self):
    events = []
    for item in self.status:
      events.append(item['event_id'])
    return events

  def valid(self):
    return True #Too lazy to write code to check all the attrs atm

  def save(self):
    members = inspect.getmembers(self)
    names = [name for name, val in members if (not '_' in name or name=='_id') and
		not inspect.isfunction(val) and not inspect.isclass(val) and
		not inspect.ismodule(val) and not inspect.ismethod(val) and
		not inspect.isbuiltin(val)]
    if not self.valid():
      raise RuntimeError("User: Object is not ready")
    db = getPymongoDB()
    dic = dict()
    for name in names:
      dic[name] = self.__dict__[name]
    Users = db.users
    self._id = Users.save(dic)
    #print("Users->insert: with id={}".format(self._id))
    return self._id
    
