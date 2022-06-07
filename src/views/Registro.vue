<template>
  <div class="p-5">
    <form class="container card p-3 shadow bg-secondary" @submit.prevent="login">
      <h2>Registrar Cuenta</h2>
      <input type="text" placeholder="Email" v-model="usuario" />
      <input type="password" placeholder="Clave" v-model="password" />
      <input type="password" placeholder="Repetir Clave" v-model="password2" />
      <input type="submit" value="Registrarse" class="btn btn-primary" />
    </form>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import bus from '../event-bus';

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';
initializeApp(firebaseConfig);
const auth = getAuth();

export default {
  data() {
    return {
      usuario: '',
      password: '',
      password2: '',
    };
  },
  computed: {
    ...mapState(['errores']),
  },
  methods: {
    login() {
      if (this.password !== this.password2) {
        this.notification('Debe repetir 2 veces la misma clave.', 'error');
      } else {
        createUserWithEmailAndPassword(auth, this.usuario, this.password).then(
          (userCreds) => {
            this.notification('Registro exitoso.');
            userCreds.user.sendEmailVerification().then(
              () => {
                this.notification('Revise su correo ' + this.usuario + ', para verificar su cuenta, luego acceda con su correo y clave.');
              },
              (error) => this.notification(error, 'error')
            );
            auth.signOut().then(() => this.$router.replace('/login'));
          },
          (error) => this.notification(error, 'error')
        );
      }
    },
  },
};
</script>
<style scoped>
form {
  max-width: 480px;
  margin: 12px auto;
}
input {
  padding: 4px;
  margin: 10px;
  border-radius: 5px;
}
</style>
