<template>
  <div id="app" class="container">
    <router-view />
  </div>
</template>
<style>
:root {
  --background: url('/assets/paper2.jpg') repeat center top;
  --color: black;
  --background-input: white;
  --font-size: 1.1em;
  --match-background: rgba(146, 196, 168, 0.75);
  --match-color: black;
  --oferta-max-height: 4.5em;
  --oferta-full-max-height: 2048px;
  --oferta-transition: max-height 0.2s ease-in-out;
}

.container {
  overflow: hidden;
  margin: 0 auto;
  max-width: 960px;
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  margin-top: 4.4em;
  background: var(--background);
  color: var(--color);
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-size);
}

input {
  font-size: var(--font-size);
}

.highlight {
  background: var(--match-background);
  color: var(--match-color);
  font-weight: bolder;
  padding: 0 4px;
  border-radius: 0.3em;
}
</style>
