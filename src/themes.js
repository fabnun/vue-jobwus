const themes = {
  setTheme(theme) {
    localStorage.setItem('theme', theme);
    var root = document.querySelector(':root');
    let style = this.styles[theme];
    Object.keys(style).forEach(function (key) {
      root.style.setProperty(key, style[key]);
    });
    this.themeSelected = theme;
  },
  themeSelected: localStorage.getItem('theme') || 'brownDark',
  styles: {
    brownDark: {
      '--background': "url('/assets/dark9.jpg') repeat center top",
      '--color': 'rgba(255, 244, 233, 0.8)',
      '--background-input': 'white',
      '--background-color': 'black',
      '--font-size': '1em',
      '--match-background': 'rgba(146, 196, 168, 0.1)',
      '--match-color': 'yellow',
      '--oferta-background': 'rgba(45, 35, 0, 0.4)',
      '--menu-background': 'rgba(40, 20, 0, 0.9)',
      '--body-margin-top': '3.2em',
      '--favorite-background': 'rgba(185, 165, 20, 0.2)',
      '--radio': '0.4em',
      '--font': "'Open Sans', sans-serif",
      '--oferta-max-height': '7.2em',
      '--oferta-line-height': '1.3em',
    },
    blueLight: {
      '--background': "url('/assets/paper2.jpg') repeat center top",
      '--color': 'rgba(20,30,40, 1)',
      '--background-input': 'black',
      '--background-color': 'white',
      '--font-size': '1.1em',
      '--match-background': 'rgba(20,30,40, 0.3)',
      '--oferta-background': 'rgba(5, 35, 66, 0.1)',
      '--match-color': 'yellow',
      '--menu-background': 'rgba(255,255,255, 0.9)',
      '--body-margin-top': '3.2em',
      '--favorite-background': 'rgba(20,80,120, 0.3)',
      '--radio': '0.4em',
      '--font': "'Bitter', serif",
      '--oferta-max-height': '7.2em',
      '--oferta-line-height': '1.3em',
    },
  },
  init() {
    this.setTheme(this.themeSelected);
  },
};

export default themes;
