#Candidate object

from Util import randomString, randomNameString
from Util import WEBS
from Util import getPymongoDB
from Util import ensureID

import random
import inspect

STATUS = ('volunteer','invited','accepted')

class Candidate:

  def __init__(self):
    pass

  def randomize(self):
    self.fName = randomNameString(2,16).capitalize()
    self.lName = randomNameString(2,16).capitalize()
    self.email = (randomString(4,35).lower()+'@'+randomString(4,35)+
			random.choice(WEBS))
    self.events = []
    self.accept_key = False
    self.note = ""

  def addEvent(self,eventID,accepted=None,status=None):
    eventID = ensureID(eventID)
    if accepted is None:
      accepted = random.choice([True,False])
    if status is None:
      status = random.choice(['volunteer','invited','accepted'])
    statusdict = {'event_id':eventID,'accepted':accepted,'status':status}
    self.events.append(statusdict)

  def valid(self):
    return (hasattr(self,'fName') and hasattr(self,'lName') and hasattr(self,'email') and
		True and hasattr(self,'events') and hasattr(self,'accept_key') and
		hasattr(self,'note'))

  def save(self):
    members = inspect.getmembers(self)
    names = [name for name, val in members if (not '_' in name or name=='_id') and
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
    self._id = Candidates.save(dic)
    #print("Candidates->insert: with id={}".format(self._id))
    return self._id
