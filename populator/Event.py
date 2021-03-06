#Event object

from Util import randomString
from Util import randomTimeInMS
from Util import WEBS
from Util import getPymongoDB

import inspect
import random
import time

class Event:

  def __init__(self):
    pass

  def randomize(self):
    self.name = randomString(3,20,' ')
    self.schedule = 'www.' + randomString(6,12) + random.choice(WEBS)
    self.location = randomString(2,10,' ')
    self.start_date = randomTimeInMS()+round(time.time()*1000)
    self.end_date = randomTimeInMS(self.start_date)
    self.capacity = random.randint(0, 500)
    self.attending = random.randint(0, self.capacity) #Might not be true to the actual number attending, but shouldn't cause problems
    self.invited = random.randint(0, 750) #Might not be true to the actual number invited, but shouldn't cause problems

  def valid(self):
    return (hasattr(self,'name') and hasattr(self,'schedule') and hasattr(self,'location') and
		hasattr(self,'start_date') and hasattr(self,'end_date') and hasattr(self, 'capacity'))

  def save(self):
    members = inspect.getmembers(self)
    names = [name for name, val in members if (name[0]!='_' or name=='_id') and
		not inspect.isfunction(val) and not inspect.isclass(val) and
		not inspect.ismodule(val) and not inspect.ismethod(val) and
		not inspect.isbuiltin(val)]
    if not self.valid():
      raise RuntimeError("Event: Object is not ready")
    db = getPymongoDB()
    dic = dict()
    for name in names:
      dic[name] = self.__dict__[name]
    Events = db.events
    self._id = Events.save(dic)
    #print("Event->insert: with id={}".format(self._id))
    return self._id

