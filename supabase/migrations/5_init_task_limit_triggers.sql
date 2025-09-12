class User:
    def __init__(self, age: int, score: int):
        self.age = age
        self.score = score
        self.adjusted_score = score + 10

    def get_age(self) -> int:
        return self.age

    def get_score(self) -> int:
        return self.adjusted_score