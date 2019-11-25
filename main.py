# Libraries
import queue

# Variables
iterations = 0 # Iterations done by the algorithms

# Classes
class MazePosition(object):
    """Class to store the coordinates from a position in the maze."""

    x = -1
    y = -1
    obstacle = False
    used = False

    def __init__(self, x, y, obstacle):
        self.x = x
        self.y = y
        self.obstacle = obstacle

    def move(self, option):
        if (option == 'up' and not self.obstacle and not self.used):
            temp = move_up()
        elif (option == 'down' and not self.obstacle and not self.used):
            temp = move_down()
        elif (option == 'right' and not self.obstacle and not self.used):
            temp = move_right()
        elif (option == 'left' and not self.obstacle and not self.used):
            temp = move_left()
        else:
            temp = None

        self.used = True
        return temp

    def move_up(self):
            return (self.x, self.y-1)

    def move_down(self):
        return (self.x, self.y+1)

    def move_left(self):
        return(self.x+1, self.y)

    def move_right(self):
        return(self.x-1, self.y)

class Maze():
    """Maze structure."""

    # Attributes
    dimension = 0
    grid = [[]]
    start = []
    end = []

    def __init__(self, n):
        dimension = n
        self.grid = [[MazePosition(x, y, False) for x in range(n)] for y in range(n)]

    def print(self):
        pass

# Algorithms

# Breadth First Search
def bfs(begin, end):
    q = queue.Queue()
    q.put(maze.getPosition(begin))
    moves = ['up', 'down', 'right', 'left']
    while not q.empty():
        v = q.get()
        if ( (v.x == end.x) and (v.y == end.y) ):
            return v
        for x in moves:
            temp = maze.getPosition(v.move(x))
            if (temp != None):
                q.put(temp)
