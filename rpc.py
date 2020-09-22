from json import dumps

from flask import session
from flask_jsonrpc import JSONRPC

jsonrpc = JSONRPC(service_url='/api', enable_web_browsable_api = False)

rooms = [{
    'users': [],
    'cities':['Астана', 'Архангельск', 'Коркино'],
}]
users = []

@jsonrpc.method('game.getUsername')
def check_username() -> str:
    username = session.get('username')
    if username:
        return username
    raise ValueError

@jsonrpc.method('App.index')
def index() -> str:
    return 'Hello world'

@jsonrpc.method('App.print')
def app_print(name: str) -> str:
    print(name)
    return 'Welcome, {0}'.format(name)

@jsonrpc.method('game.setUsername')
def set_username(username: str) -> None:
    if username in users:
        raise ValueError
    else:
        session['username'] = username
        users.append(username)

@jsonrpc.method('room.connect')
def connect(username: str) -> list:
    if not username in rooms[0]['users']:
        rooms[0]['users'].append(username)
    return rooms[0]['users']

@jsonrpc.method('room.city')
def add_city(username: str, city: str) -> None:
    print(username, city)
    for i in range(len(rooms)):
        if username in rooms[i]['users']:
            if city in rooms[i]['cities']:
                raise ValueError
            print(city.lower(), rooms[i]['cities'][-1].lower()[::-1])
            if city.lower()[0] == rooms[i]['cities'][-1].lower()[::-1][0]:
                rooms[i]['cities'].append(city)
                print('city is correct')
                return None
            print('city is not correct')
            raise ValueError

    raise ValueError


@jsonrpc.method('cities.all')
def get_all_cities(username: str) -> list:
    for i in range(len(rooms)):
        if username in rooms[i]['users']:
            return rooms[i]['cities']
    raise ValueError
