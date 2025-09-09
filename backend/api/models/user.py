class User:
    def __init__(self, id, username, email, password, roles=None):
        self.id = id
        self.username = username
        self.email = email
        self.password = password  # In a real app, this would be hashed
        self.roles = roles or ['USER']
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'roles': self.roles
        }