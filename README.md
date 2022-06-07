**¿QUE ES JOBWUS?**

Es un extractor de ofertas laborales obtenidas desde los siguientes portales de empleos en Chile:
* <https://www.bne.cl>
* <https://www.chiletrabajos.cl>
* <https://www.computrabajo.cl>
* <https://www.empleospublicos.cl>
* <https://www.trabajando.cl>

Finalizada la extracción, las ofertas son filtradas por palabras clave y son agrupadas en las siguientes categorias:
* <https://jobwus.com/compliance>
* <https://jobwus.com/info>
* <https://jobwus.com/sts>


Dentro de cada categoria se calcula la similitud entre ofertas mediante <https://github.com/stephenjjbrown/string-similarity-js> y se agrupan ofertas similares usando <https://github.com/deestan/set-clustering>.

El agrupamiento que se realiza 2 o 3 veces al dia funciona relativamente bien, pero ideal seria que se agrupara solo ofertas duplicadas. En un futuro esto se podría mejorar utilizando aprendizaje automático.

Este repositorio contiene la parte frontend del proyecto desarrollado con [vue2](https://vuejs.org) y firebase [firebase](https://firebase.google.com/)