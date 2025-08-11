class User:
    def __init__(self, age, score):
        self.age = age
        self.score = score

    def get_age(self):
        return self.age

    def get_score(self):
        return self.score + 10