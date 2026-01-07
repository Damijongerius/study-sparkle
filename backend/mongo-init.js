db = db.getSiblingDB('studybuddy');

db.createUser({
  user: 'studybuddy',
  pwd: 'studybuddy123',
  roles: [{ role: 'readWrite', db: 'studybuddy' }]
});

db.createCollection('userdatas');
