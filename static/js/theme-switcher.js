const black_theme = { 
	"--fg-color" : "white",
	"--bg-color" : "black",
	"--bg-gradient" : "linear-gradient(90deg, rgba(10, 10, 10, 1) 0%, rgba(15, 15, 15, 1) 50%, rgba(0,0,0,1) 100%)",
	"--invert" : "invert(1)",
	"--mark-bg-color" : "rgba(80,80,0,1)",
};

const white_theme = {
	"--fg-color" : "black",
	"--bg-color" : "white",
	"--bg-gradient" : "linear-gradient(90deg, rgba(235, 235, 235, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(181, 181, 181, 1) 100%)",
	"--invert" : "invert(0)",
	"--mark-bg-color" : "rgba(200,200,0,1)",
};

function save_theme_name(theme_name){
	localStorage.setItem("mytheme", theme_name);
}


function set_theme(theme){
	for (const [key, value] of Object.entries(theme)) {
		document.documentElement.style.setProperty(key, value);
	}
}


document.addEventListener("DOMContentLoaded", function() {
	document.querySelector(".theme-light").addEventListener("click", function(){
		save_theme_name("white");
		set_theme(white_theme);
	});

	document.querySelector(".theme-dark").addEventListener("click", function(){
		save_theme_name("black");
		set_theme(black_theme);
	});

	
	let theme_str = localStorage.getItem("mytheme");

	if (theme_str == null){

		save_theme_name("white");
		set_theme(white_theme);

	} else {

		switch(theme_str){
			case "black":
				set_theme(black_theme);
				break;
			case "white":
			default:
				set_theme(white_theme);
				break;
		}
	}
})


