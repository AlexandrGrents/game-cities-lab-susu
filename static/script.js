let STATE = {
	USERNAME: 0,
	SERVER: 1,
	ROOM: 2,
	GAME: 3
}

class Application
{
	constructor()
	{
		this.usernameScreen = document.getElementById('enter-username');
		this.serverScreen = document.getElementById('server-url');
		this.serverScreen.children[0].value = location.href;
		this.gameScreen = document.getElementById('game');
		this.citiesField = document.getElementById('cities')
		this.usersField = document.getElementById('users')
		this.playerUsernameField = document.getElementById('player-username')
		this._state = STATE.USERNAME;
		this.setInterface();
		this.bindButtons();
		// this.renderCities(['Астана', 'Архангельск', 'Коркино'])


		this.timer = document.getElementById('timer');

		this.getSessionUsername();
		this.activeUser = null;

		this.timerValue = 240;

		this.timerId = setInterval(this.updateTimer.bind(this), 1000)

		this.renderId = setInterval(this.render.bind(this), 4000);
	}

	updateTimer()
	{
		this.timerValue--;
		if (this.timerValue <=0 )
			this.endTime();
		else
			this.timer.innerText = Math.floor(this.timerValue/60) + ':' + this.timerValue % 60;
	}

	async endTime()
	{
		this.timerValue = 0;
		console.log('end timer');
		clearInterval(this.timerId);
	}

	async getSessionUsername()
	{
		let response = await this.sendRequest('game.getUsername', {}, '1');
		if (response.ok)
		{
			console.log(response)
			this.username = (await response.json())['result'];
			console.log('set username', username)
			this.playerUsernameField.innerText = this.username;
			this.setInterface(STATE.SERVER)
			
		}
		else
		{
			this.setInterface(STATE.USERNAME)
			this.username = null;
		}

		
	}

	get state() {return this._state}
	set state(value) {this.setInterface(value)}

	setInterface(state = null)
	{
		if (state !== null) this._state = state;
		switch(this._state)
		{
			case STATE.USERNAME:
				this.usernameScreen.hidden = false;
				this.serverScreen.hidden = true;
				this.gameScreen.hidden = true;
				break;
			case STATE.SERVER:
				this.usernameScreen.hidden = true;
				this.serverScreen.hidden = false;
				this.gameScreen.hidden = true;
				break;
			case STATE.GAME:
				this.usernameScreen.hidden = true;
				this.serverScreen.hidden = true;
				this.gameScreen.hidden = false;
				this.render();
				this.timerValue = 240;
				break;
		}
	}
	async sendRequest(method, params, id = null)
	{
		let body = {
			jsonrpc: "2.0",
			method,
			params
		};
		if (id !== null) body.id = id;
		console.log(id)
		console.log('send', body)
		let response = await fetch('/api', 
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(body)
		});
		return response;
	}
	bindButtons()
	{
		this.usernameScreen.children[1].onclick = async () =>
		{
			console.log('USERNAME'); 
			console.log(this)
			let username = this.usernameScreen.children[0].value;
			let response = await this.sendRequest('game.setUsername', {username});
			console.log(response.ok); 
			if (response.ok)
			{
				this.playerUsernameField.innerText = username;
				this.username = username;
				this.setInterface(STATE.SERVER)
			}
			else {alert('Данное имя занято. Введите другое имя пользователя.')}
		};



		this.serverScreen.children[1].onclick = async () => {
			let response = await this.sendRequest('room.connect', {username: this.username}, this.username);
			console.log(response)
			if (response.ok)
			{
				let users = (await response.json())['result'];
				console.log('SERVER'); 
				console.log(users);
				this.renserUsers(users);
				this.setInterface(STATE.GAME)	
			}
			else console.log('erron on server');
		}

		this.gameScreen.children[2].onclick = async () => {
			let city = this.gameScreen.children[1].value;
			console.log('game', city);
			let response =  await this.sendRequest('room.city', {username: this.username, city})
			console.log(response);
			if (response.ok)
			{
				this.render();
				this.gameScreen.children[1].value = '';
			}
			else
			{
				alert('Неправильное название города')
			}
			
		}
	}

	async render()
	{
		let response = await this.sendRequest('cities.all', {username: this.username}, this.username);
		console.log(response);
		let cities = (await response.json())['result'];
		console.log(cities);
		this.renderCities(cities);
	}

	renderCities(cities)
	{
		console.log('render')
		for (let i = this.citiesField.children.length-1; i>=0; i--) this.citiesField.children[i].remove();
		let p;
		for (let city of cities)
		{
			p = document.createElement('p');
			p.innerHTML = city.slice(0, city.length - 1) + `<span>${city[city.length - 1]}</span>`;
			this.citiesField.append(p);
		}
	}
	renserUsers(usernames)
	{
		for (let user of this.usersField.children) user.remove();
		let li;
		for (let username of usernames)
		{
			li = document.createElement('li');
			li.innerText = username;
			this.usersField.append(li);
		}
	}
	showActiveUser()
	{
		for (let user of this.usersField.children) user.classList.remove('active-user');
		this.usersField.children[this.activeUser].classList.add('active-user');
	}
}

let app = new Application();
globalThis.app = app;