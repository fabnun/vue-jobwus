<template>
  <div class="container text-center pt-1">
    <div v-if="!userData" style="height: 239px">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status" style="margin-top: 100px">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
    <div class="row m-4 mb-0" v-if="userData">
      <h2 class="col-12 m-0 text-right">Seguridad</h2>
      <div class="col-12"><hr /></div>
      <label class="label text-right">Correo</label>
      <input class="input" type="text" placeholder="Email" v-model="correo" />
      <label class="label text-right">Contraseña</label>
      <input class="input" type="password" v-model="password" placeholder="Nueva Contraseña" />
      <label class="label text-right">Contraseña</label>
      <input class="input" type="password" v-model="password2" placeholder="Repetir Nueva Contraseña" />
      <label class="label text-right"></label><input class="input btn btn-primary font-weight-bold" :disabled="cambioSeguridad ? false : true" @click="guardarSeguridad" type="button" placeholder="" :value="seguridadBoton" />
      <label class="label text-right"></label>
      <label class="input text-right" style="color: red">{{ seguridadAyuda }}</label>
      <h2 class="col-12 m-0 mt-4 text-right">Datos de Envío</h2>
      <div class="col-12"><hr /></div>
      <label class="label text-right">Nombre</label>
      <input class="input" type="text" placeholder="Nombre" v-model="nombre" />
      <label class="label text-right">Dirección</label>
      <input class="input" type="text" placeholder="Dirección" v-model="direccion" />
      <label class="label text-right">Comuna</label>
      <input class="input" type="text" placeholder="Comuna" v-model="comuna" />
      <label class="label text-right">Teléfono</label>
      <input class="input" type="text" placeholder="Teléfono" v-model="telefono" />
      <label class="label text-right"></label>
      <label class="text-right"><input type="checkbox" v-model="suscrito" name="checkbox" /> Suscribirse a correos</label><br />
      <label class="label text-right"></label>
      <input class="input btn btn-primary font-weight-bold" @click="guardarDatos" type="button" value="Guardar" />

      <div class="text-right p-0 pt-5 pb-3">
        <input class="input text-right btn btn-danger p-0 text-center font-weight-bold" style="width: 130px" type="button" @click="deleteAccout" value="Darse de Baja" />
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import store from '../store';
import { initializeApp } from 'firebase/app';
import { getAuth, getDB, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';
initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDB();
export default {
  data() {
    return {
      correo: '',
      password: '',
      password2: '',
      nombre: '',
      direccion: '',
      comuna: '',
      telefono: '',
      seguridadAyuda: '',
      seguridadBoton: '',
      suscrito: false,
    };
  },
  computed: {
    ...mapState(['user', 'errores', 'userData']),
    cambioSeguridad() {
      this.seguridadAyuda = this.checkPassword(this.password, this.password2);
      let resp = this.password.length > 0 && this.seguridadAyuda === '';
      this.seguridadBoton = resp ? 'Modificar Contraseña' : 'Modificar';
      if (this.correo !== auth.currentUser.email) {
        if (!this.checkEmail(this.correo)) {
          resp = false;
          this.seguridadAyuda = this.seguridadAyuda + 'Debe ingresar un correo bien formateado. ';
        } else {
          resp = resp || (this.password.length === 0 && true);
          this.seguridadBoton = !resp ? 'Modificar' : this.seguridadBoton === 'Modificar' ? 'Modificar Correo' : this.seguridadBoton + ' y Correo';
        }
      }
      return resp;
    },
  },
  methods: {
    guardarSeguridad() {
      if (this.seguridadAyuda === '') {
        if (this.password.length > 0)
          auth.currentUser
            .updatePassword(this.password)
            .then(() => {
              this.notification('Contraseña Modificada.');
              this.password = '';
              this.password2 = '';
            })
            .catch((error) => {
              this.notification(error, 'error');
              this.password = '';
              this.password2 = '';
            });
      }
      let oldEmail = auth.currentUser.email;
      if (this.correo !== auth.currentUser.email) {
        auth.currentUser
          .updateEmail(this.correo)
          .then(() => {
            this.notification('Correo Modificado.');
            store.commit('updateUserAuth', auth.currentUser);
            auth.currentUser
              .sendEmailVerification()
              .then(() => {
                this.notification(`Enviamos un correo de verificación a ${this.correo}, tambien enviamos un correo a su correo antiguo ${oldEmail}, con instrucciones para revertir la operación. `);
              })
              .catch((error) => {
                this.notification(error, 'error');
              });
          })
          .catch((error) => {
            this.notification(error, 'error');
          });
      }
    },
    guardarDatos() {
      db.collection('usuarios')
        .doc(auth.currentUser.uid)
        .set({
          nombre: this.nombre,
          direccion: this.direccion,
          comuna: this.comuna,
          telefono: this.telefono,
          suscrito: this.suscrito,
        })
        .then(() => {
          store.commit('updateUserData', {
            nombre: this.nombre,
            direccion: this.direccion,
            comuna: this.comuna,
            telefono: this.telefono,
            suscrito: this.suscrito,
          });
          console.log('Document successfully written!');
          this.notification('Datos Guardados.');
        })
        .catch((error) => {
          console.error('Error writing document: ', error);
        });
    },
    deleteAccout() {
      auth.currentUser.delete().then(
        () => {
          this.notification('Su cuenta ha sido eliminada.');
          this.$router.replace('/');
        },
        (error) => this.notification(error, 'error')
      );
    },
    updateFromStore() {
      this.correo = this.user.correo;
      this.nombre = this.userData.nombre;
      this.direccion = this.userData.direccion;
      this.comuna = this.userData.comuna;
      this.telefono = this.userData.telefono;
      this.suscrito = this.userData.suscrito;
    },
  },
  created() {
    this.updateFromStore();
  },
  watch: {
    userData: {
      deep: true,
      handler() {
        this.updateFromStore();
      },
    },
    user: {
      deep: true,
      handler() {
        this.updateFromStore();
      },
    },
  },
};
</script>
<style scoped>
.container {
  max-width: 640px;
}
.label {
  width: 100px;
  margin-top: 8px;
}
.input {
  width: calc(100% - 100px);
  margin-top: 8px;
}
</style>
