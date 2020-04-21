/* 
 *	navbar builder - (c) sarah 2020
 *	a more extensible alternative for adding nav links than to
 *	just replace the html stuff
 */
class CNavButton {
	constructor(name, href) {
		this.name = name;
		this.href = href;
	}
}

const buttons = [
	new CNavButton('Home', '/'),
	new CNavButton('Projects', '/projects/'),
	// new CNavButton('Articles', '/articles/'),
];

window.addEventListener('load', () => {
	const navbar = document.getElementById('navbar');
	
	buttons.forEach(e => {
		let newbtn = document.createElement('a');
		newbtn.append(e.name);
		newbtn.title = e.name;
		newbtn.href = e.href;
		navbar.append(newbtn);
	});
});
