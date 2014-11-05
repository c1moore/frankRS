#Event object

from Util import randomString
from Util import randomTimeInMS
from Util import DATABASE
from Util import getPymongoDB

import inspect

class Event:

  def __init__(self):
    pass

  def randomize(self):
    self.name = randomString(3,20)
    self.schedule = 'www.' + randomString(6,12) + random.choice(['.com','.org','.nz','.biz'])
    self.location = randomString(2,10)
    self.start_date = randomTimeInMS()
    self.end_date = randomTimeInMS(self.start_date)

  def valid(self):
    return (hasattr(self,name) and hasattr(self,schedule) and hasattr(self,location) and
		hasattr(self,start_date) and hasattr(self,end_date))

  def save(self):
    members = inspect.getMembers(self)
    names = [name for name, val in members if not name.contains('_') and
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
    self.id = Events.insert(dic)
    print("Event->insert: {}".format(str(dic)))
    return self.id

