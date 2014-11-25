#Attendee object

from Util import getPymongoDB
from Util import ensureID

import inspect

class Attendee:

  def __init__(self,userID,eventID,regTimeMS):
    self.attendee = ensureID(userID)
    self.event_id = ensureID(eventID)
    self.time = regTimeMS

  def valid(self):
    return (hasattr(self,'attendee') and hasattr(self,'eventid') and hasattr(self,'time'))

  def save(self):
    members = inspect.getmembers(self)
    names = [name for name, val in members if (not '_' in name or name=='_id') and
		not inspect.isfunction(val) and not inspect.isclass(val) and
		not inspect.ismodule(val) and not inspect.ismethod(val) and
		not inspect.isbuiltin(val)]
    if not self.valid():
      raise RuntimeError("Attendee: Object is not ready")
    db = getPymongoDB()
    dic = dict()
    for name in names:
      dic[name] = self.__dict__[name]
    Attendees = db.attendees
    self._id = Attendees.save(dic)
    #print("Attendees->insert: with id={}".format(self._id))
    return self._id
