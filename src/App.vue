<template>
  <div id="app" class="container">
    <router-view />
  </div>
</template>
<style>
:root {
  --background: url('/assets/dark1.jpg') repeat center top;
  --color: rgba(255, 244, 233, 0.8);
  --background-input: white;
  --background-color: black;
  --font-size: 1.1em;
  --match-background: rgba(146, 196, 168, 0.1);
  --match-color: yellow;
  --oferta-max-height: 5.6em;
  --oferta-line-height: 1.2em;
  --oferta-full-max-height: 2048px;
  --oferta-transition: max-height 0.2s ease-in-out;
  --page-max-width: 1280px;
  --menu-background: rgba(0, 0, 0, 0.9);
}

hr {
  border-color: var(--color) !important;
}

.container {
  overflow: hidden;
  margin: 0 auto;
  max-width: var(--page-max-width);
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  margin-top: 4.4em;
  background: var(--background);
  color: var(--color);
  font-family: 'Open Sans', sans-serif;
  font-size: var(--font-size);
}

input {
  font-size: var(--font-size);
}

.highlight {
  background: var(--match-background);
  color: var(--match-color);
  padding: 0 4px;
  border-radius: 0.3em;
}
</style>
