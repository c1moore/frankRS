#User object

from Util import randomString
from Util import WEBS
from Util import getPymongoDB

import random
import inspect
from datetime import date as Date

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
    self.fName = randomString(2,16).capitalize()
    self.lName = randomString(2,16).capitalize()
    self.displayName = randomString(2,16,' ')
    self.email = (randomString(4,35).lower()+'@'+randomString(4,35)+
			random.choice(WEBS))
    self.password = ""
    self.salt = ""
    self.provider = "local"
    self.roles = random.choice(ROLES)
    cday = random.randint(1,28)
    cmonth = random.randint(1,12)
    cyear = random.randint(1970,Date.today().year())
    self.created = Date(cyear,cmonth,cday)
    uyear = random.randint(cyear,Date.today().year()+1000)
    if uyear==cyear:
      umonth = random.randint(cmonth,12)
    else:
      umonth = random.randint(1,12)
    if umonth==cmonth and uyear==cyear:
      uday = random.randint(cday,28)
    else:
      uday = random.randint(1,28)
    self.updated = Date(uyear,umonth,uday)
    self.status = [] #Might have to adjust because it's a schema
    self.inviteeList = []
    self.attendeeList = []
    self.almostList = []
    self.rank = []
    self.login_enabled = True
    self.templates = makeTemplates()

  def #Add to status

  def valid(self):
    return True #Too lazy to write code to check all the attrs atm

  def save(self):
    members = inspect.getMembers(self)
    names = [name for name, val in members if not name.contains('_') and
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
    self.id = Users.insert(dic)
    print("Users->insert: {} with id={}".format(str(dic),self.id))
    return self.id
    
