#Comment schema representation for the populator

from Util import randomString
from Util import randomTimeInMS
from Util import getPymongoDB
from User import INTERESTS

import inspect
import random
from datetime import datetime

class Comment:

  def __init__(self,user_id,event_id,comment=None,interests=None,date=None,stream=None):
    self.user_id = user_id
    self.event_id = event_id
    if comment is None:
      comment = randomString(2,400,""" .!?@:;+-_*""")
    self.comment = comment
    if interests is None and stream is not 'recruiter':
      interests = random.sample(INTERESTS,random.randint(0,len(INTERESTS)//3))
    self.interests = interests
    if date is None:
      date = int(datetime.now().strftime('%s'))*1000
    self.date = date
    if stream is None:
      stream = random.choice(['social','recruiter'])
      if stream=='recruiter':
        self.interests = None
    self.stream = stream

  def save(self):
    members = inspect.getmembers(self)
    names = [name for name, val in members if (name[0]!='_' or name=='_id') and
		not inspect.isfunction(val) and not inspect.isclass(val) and
		not inspect.ismodule(val) and not inspect.ismethod(val) and
		not inspect.isbuiltin(val)]
    db = getPymongoDB()
    dic = dict()
    for name in names:
      dic[name] = self.__dict__[name]
    Comments = db.comments
    self._id = Comments.save(dic)
    #print("Comments->insert: with id={}".format(self._id))
    return self._id
