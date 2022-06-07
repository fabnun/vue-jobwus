**¿QUE ES JOBWUS?**

Es un extractor de ofertas laborales obtenidas desde los siguientes portales de empleos en Chile:
<https://www.bne.cl>
<https://www.chiletrabajos.cl>
<https://www.computrabajo.cl>
<https://www.empleospublicos.cl>
<https://www.trabajando.cl>

Finalizada la extracción, las ofertas son filtradas por palabras clave y son agrupadas en los siguientes grupos
<https://jobwus.com/compliance>
<https://jobwus.com/info>
<https://jobwus.com/sts>


Dentro de cada grupo se calcula la similitud entre ofertas mediante <https://github.com/stephenjjbrown/string-similarity-js> y luego se agrupan ofertas similares usando <https://github.com/deestan/set-clustering>

El agrupamiento funciona relativamente bien, pero ideal seria que se agrupara solo ofertas duplicadas. En un futuro esto se podría mejorar utilizando aprendizaje automático.

Este repositorio contiene la parte frontend del proyecto desarrollado con [vue2](https://vuejs.org) y firebase [firebase](https://firebase.google.com/)