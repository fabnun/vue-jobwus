<template>
  <div id="app" class="container">
    <router-view />
  </div>
</template>
<style>
:root {
  --oferta-full-max-height: 3072px;
  --oferta-transition: max-height 0.05s;
  --page-max-width: 1280px;
  --body-margin-top: 3.7em;
  --shadow-parent: rgba(251, 255, 0, 0.514) 0px 0px 0px 4px;
  --shadow-child: rgba(251, 255, 0, 0.414) 0px 0px 0px 2px;
}
h1 {
  font-size: 1.2em;
  font-weight: bolder;
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
::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: gray;
  opacity: 1; /* Firefox */
}

:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: gray;
}

::-ms-input-placeholder {
  /* Microsoft Edge */
  color: gray;
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
.highlight2 {
  background: var(--match2-background);
  color: var(--match2-color);
  border-radius: var(--radio);
  font-weight: bolder;
  padding: 0 4px;
}
</style>
