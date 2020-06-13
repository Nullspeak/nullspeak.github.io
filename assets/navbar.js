/* 
 *	navbar builder - (c) sarah 2020
 *	a more extensible alternative for adding nav links than to
 *	just replace the html stuff
 */
class CNavButton {
	constructor(name, tip, href) {
		this.name = name;
		this.tip = tip;
		this.href = href;
	}
}

const buttons = [
	new CNavButton('Home', 'Returns to the home page.', '/'),
	new CNavButton('Projects', 'See some of my projects.', '/projects/'),
	new CNavButton('Articles', 'Some articles I\'ve written.', '/articles/'),
];

window.addEventListener('load', () => {
	const navbar = document.getElementById('navbar');
	
	buttons.forEach(e => {
		let newbtn = document.createElement('a');
		newbtn.append(e.name);
		newbtn.title = e.tip;
		newbtn.href = e.href;
		navbar.append(newbtn);
	});
});
