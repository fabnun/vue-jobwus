<template>
  <div class="cfg">
    <h1>CONFIGURACIÓN</h1>
    <hr />
    <div>
      <strong>Theme: </strong>
      <select class="button" @change="setTheme">
        <option :value="theme" v-for="theme in Object.keys(themes.styles).sort()" :key="theme" :selected="themes.themeSelected === theme">{{ theme }}</option>
      </select>
    </div>
    <div>
      <strong> Zoom: </strong>
      <select class="button" @change="setZoom">
        <option :value="zoom" v-for="zoom in Object.keys(themes.zooms)" :key="zoom" :selected="themes.themeZoom === zoom">{{ zoom }}</option>
      </select>
    </div>
    <hr />
    <div>
      <strong>Voz: </strong>
      <select class="button" @change="setVoice">
        <option v-for="item in voiceList" :key="item" :value="item" :selected="item === voice">{{ item === '' ? 'ninguna' : item.substring(item.indexOf(' - ') > -1 ? item.indexOf(' - ') + 3 : 0) }}</option>
      </select>
      <span v-if="voice !== ''">
        <br />
        <strong>Rapidez de lectura: </strong>
        <select class="button" @change="setSpeed">
          <option :value="speed" v-for="speed in speeds" :key="speed" :selected="speed === voiceSpeed">{{ speed * 100 }}%</option>
        </select>
      </span>
    </div>

    <hr />

    <input type="checkbox" @click.stop="" id="ignorarTildes" v-model="ignorarTildes" />
    <label style="position: relative; top: -0px !important; margin-left: 10px" class="menu-button" @click.stop="" for="ignorarTildes">Ignorar tildes en la busqueda.</label>
    <br />
    <hr />
    <button class="button" @click.stop="importConfig"><download-icon class="buttonCfg" />Importar Localstorage</button>&nbsp;
    <button @click.stop="exportConfig" class="button"><upload-icon class="buttonCfg" />Exportar Localstorage</button>
    <!-- <button @click.stop="logout" class="button"><upload-icon class="buttonCfg" />LOGOUT</button> -->
    <!-- <button class="button">undo</button>
    <button class="button">redo</button> -->
    <br />
    <br />
    <hr />
    <p></p>

    <h1>¿QUE ES JOBWUS?</h1>
    <br />

    <p>
      Es un extractor de ofertas laborales obtenidas desde los siguientes portales de empleos en Chile:<br /><br />
      <a href="#" @click="go('https://www.bne.cl', true)">bne.cl</a><br />
      <a href="#" @click="go('ttps://www.chiletrabajos.cl', true)">chiletrabajos.cl</a><br />
      <a href="#" @click="go('https://www.empleospublicos.cl', true)">empleospublicos.cl</a><br />
      <a href="#" @click="go('https://www.getonbrd.com/', true)">getonbrd.com</a><br />
      <a style="text-decoration: line-through" href="#" @click="go('https://www.trabajando.cl', true)">trabajando.cl</a><br />
      <a style="text-decoration: line-through" href="#" @click="go('https://www.computrabajo.cl', true)">computrabajo.cl</a><br />
    </p>
    <br />
    <p>
      Finalizada la extracción, las ofertas son filtradas por palabras clave y son agrupadas en las siguientes categorias:<br /><br />
      <a href="#" @click="go('/compliance')">https://jobwus.com/compliance</a><br />
      <a href="#" @click="go('/info')">https://jobwus.com/info</a><br />
      <a href="#" @click="go('/sts')">https://jobwus.com/sts</a><br />
      <a href="#" @click="go('/profes')"> https://jobwus.com/profes</a><br />
    </p>
    <br />
    <p>Dentro de cada categoria se calcula la similitud entre ofertas mediante <a href="#" @click="go('https://github.com/stephenjjbrown/string-similarity-js', true)" target="_blank">string-similarity-js</a> y se agrupan ofertas similares usando <a href="#" @click="go('https://github.com/deestan/set-clustering', true)" target="_blank">set-clustering</a></p>
    <br />
    <p>El agrupamiento que se realiza 2 veces al día retorna grupos de ofertas similares, pero más útil sería poder identificar con seguridad las ofertas duplicadas. En un futuro esto se podrá mejorar utilizando aprendizaje automático, que tambien ayudara a hacer un mejor match de las ofertas seleccionadas.</p>
    <br />
    <p>
      El repositorio github de la parte frontend del proyecto esta en<br />
      <a href="#" @click="go('https://github.com/fabnun/vue-jobwus', true)" target="_blank">fabnun/vue-jobwus</a>
    </p>

    <div style="display: grid; justify-content: center; align-content: center; height: 128px">
      <a href="#" @click="go('https://twitter.com/jobwus', true)" style="text-decoration: none" target="_blank">
        <twitter-icon class="button-icon" />
        <span style="position: relative; top: -6px">@jobwus</span>
      </a>
    </div>
    <div>
      <h3>Ejemplo de filtro</h3>
      <textarea style="width: 100%; resize: none; background: transparent; color: white; border: none; z-index: -1" readonly rows="8" editable="false">
(node|express|vue|react|svelte|angular|ember|cypress|next|nuxt|apollo|quazar|meteor|backbone|knockout|jquery|mootools|dojo|ext|zepto|jquery( ?ui)?|phantom|axios|lodash|underscore|moment)( ?js)?, sql, (mysql|postgres|sqlite|ms|microsoft)( ?sql)?( ?server)?, redis, redux, mongo( ?db)?, maria ?db, nosql, (aws|amazon)? ?(s3|ec2|elb|cloudfront|ses|sns|sqs|s3|sdb|iam|sts|route53|cloudfront|cloudwatch|cloudformation|cloudtrail|cloudwatchlogs)?, (gcloud|google)? ?(big ?query|(compute|app)( engine)?|big ?table|storage|datastore|datastore|pubsub|firebase)?, azure ?(storage|sql|cosmosdb|table|queue|servicebus|eventhub)?, skills?, web ?(pack|socket)?, vite, airflow, babel, sass|less|stylus|scss|css3?|html5?|xml|json|yaml, npm, bower, gulp, grunt, ant, maven, gradle, java, kotlin, typescript, golang, go, rust, swift, python, ruby, php, c, csharp, javascript, js, ((al|por lo) menos )?(1|2|3|4|5|6|7|8|9|10) (a(ñ|n)o|mese?)s?( de experiencia)?, (data ?)?(mining|science|engineers?|scientists?|analysts?), (ejecucion |civil |area )?informatic(a|o|as|os), (ing|ingenier(o|a|as|os|ia)|analista)( de sistemas| de datos| de desarrollos?)?, (ing|ingenier(o|a|os|as|ia))( civil)?( (en )?ejecucion)?( en)?( computacion)?( e)?( informatic(a|o|as|os))?, (ing|ingenier(o|os|a|as|ia)|cientific(o|a|as|os)|ciencia|analist(a|as)|explorador(es)?|analisis|analitica|reporte|recopilacion|carga|modelado) de datos, (plazo|contrato)( indefinido| fijo), bruto, (software |mobile |game )?developers?, (titul(o|ado|ados|adas)|practica)( profesional)?, analisis, analistas?( programador(a|es)?| qa)?, analyst, apache, apis?( ?rest( ?ful)?)?, app, arquitect(o|a|os|as)( de)? software, arquitectos?, auditor(ia|ias|es|a)( t ?i), automati(on|zador|zacion), bases? de datos?, batch, bbdd( relacional)?, bd, bi, bonos?, bootstrap, bps, broker, business intelligence, capacitacion(es), casa, cassandra, cd, certificacion(es)?, ci, cobol, computacion, consultor(ia|a|es)?, contenedor(es)?, cumplimiento de metas, curricul(o|um)( vitae)?, cv, cursos?, dashboards,
        databases?, db, db2, ddbb, desarrollador(a|es)?|full ?stack|front ?end|back ?end, desarrollo de software, designers?, diseñador(a|es|as)? despliegue, dev ?sec ?ops, development, dev ?ops, digital ocean, diseños?, django, docentes?, docker, documenta(r|cion), doker, dom, eclipse, engineer, english, ingles, escrit(o|a), especialistas?, etls?, excel, experiencia( del? usuario)?, extreme programing, firewall, firma electronica, flutter, fortran, frameworks?, front, gcp, git ?(hub|lab|kraken)?|control de versiones, git(hub), graphq, growth marketing, hadoop, heroku, hibrid(a|o), hive, home office, home, horario flexible, ide, informatic(a|o|as|os), integracion continua, integracion(es)?, inteligencia artificial, ionic, ios, iso (27001|27000|22301), jboss( eap), jbuilder, jefe, jenkink?s, jest, jira, jpa, jr, juniors?, kafka, kanban, knowledge discovery, kpis?, kubernetes, lambda, laravel, lead, lenguajes?, lider(azgo)?, linux, liquido, lxd, machine learning, mantenimiento, matematicas?, matlab, maven, metodologias? agil(es)?, micro ?servicios?, mlops, mocha, movil(es), mvc, mvvm, namp, native, net( ?core)?, neto, nginx, nivel superior, nube, objective c, oop, open ?jdk, operador, oracle( ?service ?bus|10|11|12|13), oracle( database| ?db)?, oral(mente)?, orm, otec, owasp, pair programming, pdf, sprint, pentaho, pg ?admin, pg ?modeler, pipelines, postman, power ?bi, practica(nte)?, presencial, cloud, (pretensiones de )?(renta|sueldo)( de)?( mercado)?, procedimientos? almacenados, profesional(es)?, programa(cion|dor|dores|dora|doras), programador(a|es)|genexus, prometh?eus, pruebas de integracion, pruebas( integradas| funcionales), pruebas?( unitarias?)?, pyspark, qas?, r, rds, recomendacion(es)?, redhat, redis, redshift, redux, remota, remote( work)?, remoto, renta, requisitos, rest( ?ful)?, ruby( on rails)?, s3, salary, sales ?force, sap, sas, sass, script, scrum, security, seguridad de la informacion, selenium, semi ?seniors?, semipresencial, seniors?, sequelize, series temporales, serverless,
        servic(ios?|es?), servicios?, sistemas, sns, soa, soap, soc, software, solid, soporte, spring( ?boot)?( ?data ?jpa)?, spring( boot), sre, start ?ups?, sueldo, swarm, swift, t i, tableau, tailwind, tecnicos?, teletrabajo, terraform, test(ing)?( automati(zado|co)| funcional), test(ing)?, ti, togaf, tomcat, trabajo( en equipo| grupal)?, trainnes?, typescript, ubuntu, ui, unix, ux, vecari(o|a|os|as), verbal, versionamiento, visual net, visualforce, vpc, warehouse, was, web, weblogic( server), wildfly, windows, wordpress, zabbix
      </textarea>
    </div>
  </div>
</template>
<script>
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';
initializeApp(firebaseConfig);
const auth = getAuth();

import DownloadIcon from 'vue-material-design-icons/Download.vue';
import UploadIcon from 'vue-material-design-icons/Upload.vue';
import twitterIcon from 'vue-material-design-icons/Twitter.vue';

export default {
  props: ['words', 'voiceList'],
  components: {
    DownloadIcon,
    UploadIcon,
    twitterIcon,
  },
  data() {
    return {
      themes: require('../themes.js').default,
      speeds: [1, 1.25, 1.5, 1.75, 2],
      oldCfg: this.$store.state.words,
      voiceSpeed: parseFloat(this.localGetItem('voiceSpeed')) || 1,
      voice: this.localGetItem('voice') || null,
    };
  },
  methods: {
    go(url, blank = false) {
      if (blank) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    },
    logout() {
      sendPasswordResetEmail(auth).then(
        () => {
          this.notification('Enviamos un email para reestablecer su clave, revise su correo ');
        },
        (error) => this.notification(error, 'error')
      );
    },
    setTheme(e) {
      this.themes.setTheme(e.target.value);
    },
    setZoom(e) {
      this.themes.setZoom(e.target.value);
    },
    setVoice(e) {
      this.voice = e.target.value;
      this.localSetItem('voice', this.voice);
      this.$emit('setVoice', e.target.value);
    },
    setSpeed(e) {
      this.voiceSpeed = parseFloat(e.target.value);
      this.localSetItem('voiceSpeed', this.voiceSpeed);
      this.$emit('setSpeed', e.target.value);
    },
    setCfg(e) {
      if (confirm('¿Estás seguro de que quieres cambiar las palabras clave?')) {
        this.localSetItem('cfg', e.target.value);
        location.reload();
      } else {
        e.target.value = this.oldCfg;
      }
    },
    importConfig() {
      let fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      fileInput.addEventListener('change', (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
          let config = JSON.parse(e.target.result);
          this.localSetItem('ignorarTildes', config.ignorarTildes);
          this.localSetItem('folder', config.folder);
          this.localSetItem('zoom', config.zoom);
          this.localSetItem('theme', config.theme);
          this.localSetItem('voice', config.voice);
          this.localSetItem('voiceSpeed', config.voiceSpeed);
          this.localSetItem('filtro', config.filtro);
          this.localSetItem('searchConfig', config.searchConfig);
          this.localSetItem('searchListSelect', config.searchListSelect);
          this.localSetItem('favoritos', config.favoritos, true);
          this.localSetItem('archivados', config.archivados, true);
          location.reload();
        };
        reader.readAsText(file);
      });
      fileInput.click();
      //this.$store.dispatch('importConfig');
    },
    exportConfig() {
      let config = {
        ignorarTildes: this.localGetItem('ignorarTildes'),
        folder: this.localGetItem('folder'),
        filtro: this.localGetItem('filtro'),
        searchConfig: this.localGetItem('searchConfig'),
        searchListSelect: this.localGetItem('searchListSelect'),
        favoritos: this.localGetItem('favoritos', true),
        archivados: this.localGetItem('archivados', true),
        zoom: this.localGetItem('zoom'),
        theme: this.localGetItem('theme'),
        voice: this.localGetItem('voice'),
        voiceSpeed: this.localGetItem('voiceSpeed'),
      };
      let file = new Blob([JSON.stringify(config)], { type: 'application/json' });
      let fileURL = URL.createObjectURL(file);
      let a = document.createElement('a');
      a.href = fileURL;
      a.download = 'config.json';
      a.click();
    },
  },
  mounted() {
    this.voice = this.localGetItem('voice') || '';
    this.voiceSpeed = parseFloat(this.localGetItem('voiceSpeed') || 1);
    this.$emit('setVoice', this.voice);
    this.$emit('setSpeed', this.voiceSpeed);
  },
  computed: {
    ignorarTildes: {
      get() {
        return this.$store.state.ignorarTildes;
      },
      set() {
        this.$store.commit('setIgnorarTildes');
      },
    },
  },
};
</script>
<style scoped>
.buttonCfg {
  position: relative;
  top: 4px;
}
.cfg {
  font-size: 0.9em;
}
.button {
  margin: 2px;
  outline: none;
  border: 1.5px solid var(--color);
  border-radius: var(--radio);
  cursor: pointer;
  padding: 0em 0.3em;
}
</style>
