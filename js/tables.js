"use strict";

/**
 * This function helps to draw table and fill it with JSON data from server.
 * 
 * @param {Object} config that contains setup info for table. MUST have field "parent" and "apiURL" to work properly.
 */
function DataTable(config) {
	let parent = document.querySelector(config['parent']);

	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}

	let table = document.createElement('table');
	table.classList.add('nice');
	parent.appendChild(table);

	let tHead = document.createElement('thead');
	table.appendChild(tHead);

	let tHeadRow = document.createElement('tr');
	tHead.appendChild(tHeadRow);

	for (let i = 0; i <= config.columns.length; i++) {
		let th = document.createElement('th');
		tHeadRow.appendChild(th);
	}

	let headings = parent.querySelectorAll('th');
	for (let i = 0; i < headings.length - 1; i++) {
		headings[i].innerText = config.columns[i].title;
		headings[i].setAttribute('value', config.columns[i].value);
	}

	let tBody = document.createElement('tbody');
	table.appendChild(tBody);

	processGet(config, headings, tBody);

	newUser(parent, config, headings, tBody);
}

/**
 * This function get's data from backend and adds it to the table using config and headings.
 * 
 * @param {Object} config that contains setup info
 * @param {Object} headings that condatins th tags from table
 * @param {Object} tBody that contains tbody tag
 */
async function processGet(config, headings, tBody) {
	let response;
	if (config['apiUrl']) {
		response = await fetch(config['apiUrl'], {
			method: 'GET'
		});
	}

	if (response.ok) {
		response.json().then(users => {
			for (let prop in users.data) {
				let row = document.createElement('tr');
				for (let i = 0; i < config.columns.length; i++) {
					let td = document.createElement('td');
					td.setAttribute('value', headings[i].getAttribute('value'));
					if (new Date(users.data[prop][td.getAttribute('value')]) != "Invalid Date") {
						td.innerText = simplifyDate(new Date(users.data[prop][td.getAttribute('value')]));
					} else {
						td.innerText = users.data[prop][td.getAttribute('value')] || "";
					}
					row.appendChild(td);
				}
				let td = document.createElement('td');
				let button = document.createElement('button');
				button.innerText = "Delete";
				button.classList.add("btn");
				button.addEventListener("click", function () {
					deleteUser(config['apiUrl'] + "/" + prop, config);
					row.remove();
				});
				row.appendChild(td);
				td.appendChild(button);
				tBody.appendChild(row);
			}
		});
	} else {
		throw new Error("Something went wrong. Can't get data from backend.")
	}
}

/**
 * This function adds "new user" functionality. It adds "Add new user button" above the table.
 * This button adds new table row that contains input tags at start of the table. 
 * Creates new user object and fills it's fields whenever any input has been changed.
 * And when object field's has been filled it send's POST request to backend with new user data in JSON format.
 * 
 * @param {Object} parent that contains link to parent tag where table puts in to
 * @param {Object} config that contains setup info
 * @param {Object} headings that condatins th tags from table
 * @param {Object} tBody that contains tbody tag
 */
function newUser(parent, config, headings, tBody) {

	let addBtn = addNewUserButton();
	parent.prepend(addBtn);

	addBtn.addEventListener("click", function () {

		let row = document.createElement('tr');
		let user = {};

		for (let i = 0; i < config.columns.length; i++) {
			let td = document.createElement('td');

			let inpt = document.createElement('input');
			inpt.setAttribute('type', 'text');
			inpt.classList.add('inpt');
			inpt.setAttribute('name', headings[i].getAttribute('value'));
			inpt.setAttribute('placeholder', "Enter " + headings[i].getAttribute('value'));

			inpt.addEventListener('input', function () {
				inpt.classList.remove('required');
				user[headings[i].getAttribute('value')] = inpt.value;
			});

			inpt.addEventListener("keypress", function (e) {
				let isFilledObj = isFilled(user, config.columns.length);

				if (e.key === "Enter" && !isFilledObj) {

					let emptyInputs = document.querySelectorAll(".inpt");

					emptyInputs.forEach(function (element) {
						if (!element.value) {
							element.classList.add('required');
						}
					});

				} else if (e.key === "Enter" && isFilledObj) {
					postUser(user, config, tBody, headings);
					return;
				}
			});

			td.appendChild(inpt);
			row.append(td);
		}

		tBody.prepend(row);
	});
}

/**
 * This function turns Date to apropriate string format and returns it.
 * 
 * @param {Object} dateObj that contains birthday info
 * @returns {String} with formatted Date info
 */
function simplifyDate(dateObj) {
	let month = dateObj.getMonth();
	switch (month) {
		case 0:
			month = "January";
			break;
		case 1:
			month = "February";
			break;
		case 2:
			month = "March";
			break;
		case 3:
			month = "April";
			break;
		case 4:
			month = "May";
			break;
		case 5:
			month = "June";
			break;
		case 6:
			month = "July";
			break;
		case 7:
			month = "August";
			break;
		case 8:
			month = "September";
			break;
		case 9:
			month = "October";
			break;
		case 10:
			month = "November";
			break;
		case 11:
			month = "December";
			break;
	}
	let correctDate = dateObj.getDate() + " " + month + " " + dateObj.getFullYear();
	return correctDate;
}

/**
 * This function deletes user from table by sending DELETE request to backend. Then re-renders table.
 * 
 * @param {String} userId that contains URL for fetch request
 * @param {Object} config that contains setup info for table
 */
async function deleteUser(userId) {
	let response = await fetch(userId, {
		method: 'DELETE'
	});
	if (!response.ok) {
		throw new Error("Something went wrong. Can't delete!");
	}
}

/**
 * This function adds button named "Add new user".
 * 
 * @returns link to "Add new user" button
 */
function addNewUserButton() {
	let addBtn = document.createElement('button');
	addBtn.innerText = "Add new user";
	addBtn.classList.add('btn__add');
	return addBtn;
}

/**
 * This function identifies if object's fields has been filled out or not.
 * 
 * @param {Object} obj that contains new user data
 * @param {Number} length number of the columns
 * @returns {Boolean} true if field's has been filled, false if not
 */
function isFilled(obj, length) {
	for (let prop in obj) {
		if (!obj[prop]) {
			return false
		}
	}

	if (Object.keys(obj).length != length) {
		return false;
	}

	return true;
}

/**
 * This function used to send POST request to backend with new user info in JSON format.
 * After response table is re-rendered.
 * 
 * @param {Object} obj that contains new user info
 * @param {Object} config that contains setup info for table
 */
async function postUser(obj, config) {
	let response = await fetch(config['apiUrl'], {
		method: 'POST',
		body: JSON.stringify(obj),
		headers: {
			'Content-type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error("Something went wrong! Can't add new user.")
	} else {
		//get data from backend without reloading page
		DataTable(config);
	}

}

/**
 * Object that contains configuration for DataTable function. Field "parent" and "apiURL" is REQUIRED for function to work.
 */
const config1 = {
	parent: '#usersTable01',
	columns: [
		{ title: 'Name', value: 'name' },
		{ title: 'Surname', value: 'surname' },
		{ title: 'Birthday', value: 'birthday' },
		{ title: 'Avatar', value: 'avatar' },
	],
	apiUrl: "https://mock-api.shpp.me/apanov/users"
};

DataTable(config1);