#Candidate object

from Util import randomString
from Util import WEBS
from Util import getPymongoDB

import random
import inspect

STATUS = ('volunteer','invited','accepted')

class Candidate:

  def __init__(self):
    pass

  def randomize(self):
    self.fName = randomString(2,16).capitalize()
    self.lName = randomString(2,16).capitalize()
    self.email = (randomString(4,35).lower()+'@'+randomString(4,35)+
			random.choice(WEBS))
    self.status = random.choice(STATUS)
    self.events = []
    self.accept_key = False
    self.note = ""

  def valid(self):
    return (hasattr(self,fName) and hasattr(self,lName) and hasattr(self,email) and
		hasattr(self,status) and hasattr(self,events) and hasattr(self,accept_key) and
		hasattr(self,note))

  def save(self):
    members = inspect.getMembers(self)
    names = [name for name, val in members if not name.contains('_') and
		not inspect.isfunction(val) and not inspect.isclass(val) and
		not inspect.ismodule(val) and not inspect.ismethod(val) and
		not inspect.isbuiltin(val)]
    if not self.valid():
      raise RuntimeError("Candidate: Object is not ready")
    db = getPymongoDB()
    dic = dict()
    for name in names:
      dic[name] = self.__dict__[name]
    Candidates = db.candidates
    self.id = Candidates.insert(dic)
    print("Candidates->insert: {} with id={}".format(str(dic),self.id))
    return self.id
