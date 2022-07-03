const themes = {
  setZoom(zoom) {
    localStorage.setItem('zoom', zoom);
    var root = document.querySelector(':root');
    root.style.setProperty('--zoom', this.zooms[zoom]);
  },
  getZoom() {
    let zoom = localStorage.getItem('zoom');
    zoom = this.zooms[zoom];
    return zoom ? parseFloat(zoom) : 1.0;
  },
  setTheme(theme) {
    localStorage.setItem('theme', theme);
    var root = document.querySelector(':root');
    let style = this.styles[theme];
    Object.keys(style).forEach(function (key) {
      root.style.setProperty(key, style[key]);
    });
    this.themeSelected = theme;
  },
  themeSelected: localStorage.getItem('theme') || 'blueDark',
  themeZoom: localStorage.getItem('zoom') || 'Normal',
  zooms: {
    'Mas chico': '0.92',
    Chico: '0.96',
    Normal: '1',
    Grande: '1.04',
    'Mas grande': '1.08',
  },
  styles: {
    blueDark: {
      '--background': "url('/assets/dark4.jpg') repeat center top",
      '--color': 'rgba(239, 249, 255, 0.8)',
      '--background-input': 'white',
      '--background-color': 'black',
      '--font-size': '1em',
      '--match-background': 'rgba(0, 0, 0,.5)',
      '--match-color': 'yellow',
      '--oferta-background': 'rgba(15, 35, 66, 0.3)',
      '--menu-background': 'rgba(0, 10, 20, 0.9)',
      '--favorite-background': 'rgba(10, 165, 185, 0.2)',
      '--radio': '0.3em',
      '--font': "'Open Sans', sans-serif",
      '--oferta-max-height': '8.77em',
      '--oferta-line-height': '1.3em',
      '--toolbar-background': 'rgb(12, 29, 44)',
    },
    blueLight: {
      '--background': "url('/assets/paper2.jpg') repeat center top",
      '--color': 'rgba(20,30,40, 1)',
      '--background-input': 'white',
      '--background-color': 'black',
      '--font-size': '1.1em',
      '--match-color': 'yellow',
      '--match-background': 'red',
      '--oferta-background': 'rgba(139,167,180,.3)',

      '--menu-background': 'rgba(139,167,180,.9)',
      '--favorite-background': 'rgba(20,120,160, 0.3)',
      '--radio': '0.3em',
      '--font': "'Bitter', serif",
      '--oferta-max-height': '8.76em',
      '--oferta-line-height': '1.3em',
      '--toolbar-background': 'rgb(167,178,183)',
    },
    brownDark: {
      '--background': "url('/assets/dark9.jpg') repeat center top",
      '--color': 'rgba(255, 244, 233, 0.8)',
      '--background-input': 'white',
      '--background-color': 'black',
      '--font-size': '1em',
      '--match-background': 'rgba(146, 196, 168, 0.1)',
      '--match-color': 'yellow',
      '--oferta-background': 'rgba(45, 35, 0, 0.3)',
      '--menu-background': 'rgba(40, 20, 0, 0.9)',
      '--favorite-background': 'rgba(185, 165, 20, 0.2)',
      '--radio': '0.6em',
      '--font': "'Open Sans', sans-serif",
      '--oferta-max-height': '8.77em',
      '--oferta-line-height': '1.3em',
      '--toolbar-background': 'rgb(32, 29, 18)',
    },
  },
  init() {
    this.setTheme(this.themeSelected);
    this.setZoom(this.themeZoom);
  },
};

export default themes;
