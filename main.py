# Libraries
import queue

# Variables
iterations = 0 # Iterations done by the algorithms

# Classes
class MazePosition(object):
    """Class to store the information of the position in the maze."""

    obstacle = False
    used = False

    def __init__(self, obstacle):
        self.obstacle = obstacle

    def setUsed(self):
        self.used = True

class Maze():
    """Maze structure."""

    # Attributes
    dimension = 0
    grid = [[]]
    start = [0, 0]
    end = [0, 0]

    def __init__(self, n):
        dimension = n
        self.grid = [[MazePosition(False) for x in range(n)] for y in range(n)]

    def move(self, position, option):
        self.grid[position[0]][position[1]].setUsed()
        if (option == 'up'):
            position[1] = -1
        elif (option == 'down'):
            position[1] = 1
        elif (option == 'right'):
            position[0] = 1
        elif (option == 'left'):
            position[1] = -1
        else:
            temp = None
        # Check if the position is a valid and new option
        if ( (position[0] > -1) and (position[1] > -1)):
            temp = self.grid[position[0]][position[1]]
            if (temp.obstacle or temp.used):
                 return None
            else:
                return position
        else:
            return None

    def print(self):
        pass

# Algorithms

# Breadth First Search
def bfs(maze, begin, end):
    q = queue.Queue()
    q.put(begin)
    moves = ['up', 'down', 'right', 'left']
    while not q.empty():
        v = q.get()
        if ( (v[0] == end.x) and (v[1] == end.y) ):
            return v
        for x in moves:
            temp = maze.move(v, x)
            if (temp != None):
                q.put(temp)

# Depth First Search
def dfs(maze, v):
    s = []
    moves = ['up', 'down', 'right', 'left']
    if ( (v[0] == end.x) and (v[1] == end.y) ):
        return v
    for x in moves:
        temp = maze.move(v,x)
        if (temp != None):
            s.append(temp);
            dfs(s.pop())

# Hill Climbing
def hc(maze, v)
# Best First Search
# A*
