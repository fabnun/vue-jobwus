<template>
  <div id="app" class="container">
    <router-view />
  </div>
</template>
<style>
:root {
  --oferta-full-max-height: 3072px;
  --oferta-transition: max-height 0.2s;
  --page-max-width: 1280px;
  --body-margin-top: 4.2em;
}
body {
  zoom: var(--zoom) !important;
}
body {
  margin-bottom: 6em;
}

strong {
  font-weight: bolder;
}

a {
  color: var(--color);
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
  margin-top: var(--body-margin-top);
  background: var(--background);
  color: var(--color);
  font-family: var(--font);
  font-size: var(--font-size);
}

input,
select {
  font-size: var(--font-size);
  font-family: var(--font);
}

.highlight {
  background: var(--match-background);
  color: var(--match-color);
  border-radius: var(--radio);
  font-weight: bolder;
  padding: 0 4px;
}
</style>
