# Libraries
import queue

# Variables
iterations = 0 # Iterations done by the algorithms

# Classes
class MazePosition(object):
    """Class to store the information of the position in the maze."""

    obstacle = False
    used = False
    distance = -1

    def __init__(self, obstacle):
        self.obstacle = obstacle

    def setUsed(self):
        self.used = True

    def setDistance(self, value):
        self.distance = value


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

def distanceBetweenDots(a, b):
    d = sqrt( (a[0]-b[0])^2+(a[1]-b[1])^2 )
    return d

# Breadth First Search
def bfs(maze, begin, end):
    q = queue.Queue()
    q.put(begin)
    moves = ['up', 'down', 'right', 'left']
    while not q.empty():
        v = q.get()
        if ( (v[0] == end[0]) and (v[1] == end[0]) ):
            return v
        for x in moves:
            temp = maze.move(v, x)
            if (temp != None):
                q.put(temp)

# Depth First Search
def dfs(maze, v):
    s = []
    moves = ['up', 'down', 'right', 'left']
    if ( (v[0] == end[0]) and (v[1] == end[0]) ):
        return v
    for x in moves:
        temp = maze.move(v,x)
        if (temp != None):
            s.append(temp);
            dfs(s.pop())

# Hill Climbing
#def hc(maze, v)

# Best First Search
def bestfs(maze, begin, end):
    q = queue.Queue()
    moves = ['up', 'down', 'right', 'left']
    v = begin
    maze[v[0]][v[1]].setDistance(v, end)
    q.put(v)
    while not q.empty():
        v = q.get()
        if ( (v[0] == end[0]) and (v[1] == end[0]) ):
            return v
        tempQueue = []
        for x in moves:
            temp = maze.move()
            maze[temp[0]][temp[1]].setHeuristic(v, end)
            tempQueue.append(temp)
        for x in range(len(tempQueue)):
            # x, y = y, x Sort queue
            pass
        for x in tempQueue:
            q.put(x)
    return None

# A*
def astar(maze, begin, end):
    q = queue.Queue()
    q.put(begin)
    moves = ['up', 'down', 'right', 'left']
    came_from = {}
    cost_so_far = {}
    came_from[begin] = None
    cost_so_far[begin] = 0

    while not q.empty():
        v = q.get()
        if ( (v[0] == end[0]) and (v[1] == end[0]) ):
            break
        for x in moves:
            next = maze.move(v, x)
            cost = cost_so_far[v] + distanceBetweenDots(v, next)
            if next not in cost_so_far or cost < cost_so_far[next]:
                cost_so_far[next] = cost
                priority = new_cost + distanceBetweenDots(next, end)
                q.put(next)
                came_from[next] = current
    return came_from, cost_so_far
