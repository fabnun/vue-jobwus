<template>
  <div class="p-3 pt-2">
    <div class="form container card p-3 shadow bg-secondary">
      <a href="https://vue-forum-app.herokuapp.com/">foro referencia</a>
      <h2>Acceso</h2>
      <input type="text" placeholder="Email" v-model="usuario" />
      <input type="password" placeholder="Clave" @keyup.enter="login" v-model="password" />
      <button class="btn btn-primary font-weight-bold" @click="login">Acceder</button>
      <div class="row">
        <div class="col-sm-6 col-12 mt-3"><button class="btn btn-secondary text-dark p-0 w-100" @click="resetModal">¿Olvido su Clave?</button></div>
        <div class="col-sm-6 col-12 mt-3"><button class="btn btn-secondary text-dark p-0 w-100" @click="verifyAccountModal">Reenviar Verificación</button></div>
        <div class="col-sm-6 col-12 mt-3"><router-link class="btn btn-secondary text-dark p-0 w-100" to="registro"> Registrar Cuenta </router-link></div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';
initializeApp(firebaseConfig);
const auth = getAuth();

export default {
  data() {
    return {
      usuario: '',
      password: '',
    };
  },
  computed: {
    ...mapState(['errores']),
  },
  beforeCreate() {
    // bus.$off('MODAL_CLICK');
  },
  mounted() {
    // bus.$on('MODAL_CLICK', (id, btn) => {
    //   console.log(id, btn);
    //   if (btn === 'Proceder') {
    //     if (id === 'verificacion') {
    //       this.verifyAccount();
    //     } else if (id === 'resetClave') {
    //       this.reset();
    //     }
    //   }
    // });
  },
  methods: {
    verifyAccountModal() {
      bus.$emit(
        'MODAL',
        'verificacion',
        'Reenviar Verificación',
        `<p>Se enviara un nuevo correo de verificacion a <strong>${this.usuario}</strong><br><br>
				Requiere el ingreso de su contraseña.</p>`,
        ['Proceder', 'Cancelar'],
        ['primary']
      );
    },
    resetModal() {
      if (
        confirm(`Se enviara un correo a <strong>${this.usuario}</strong>
			 	con instrucciones para asignar una nueva contraseña</p>`)
      ) {
        auth.sendPasswordResetEmail(this.usuario).then(
          () => {
            this.notification('Enviamos un email para reestablecer su clave, revise su correo ' + this.usuario);
          },
          (error) => this.notification(error, 'error')
        );
      }
    },
    verifyAccount() {
      //bus.$off('MODAL_CLICK')
      signInWithEmailAndPassword(auth, this.usuario, this.password).then(
        (userCredential) => {
          console.log(userCredential.user.emailVerified);
          if (userCredential.user.emailVerified) {
            this.notification('Este correo ' + userCredential.user.email + ' ya fue verificado.');
          } else {
            userCredential.user.sendEmailVerification().then(
              () => {
                this.notification('Enviamos un email de verificación, revise su correo: ' + userCredential.user.email);
                auth.signOut();
              },
              (error) => this.notification(error, 'error')
            );
          }
        },
        (error) => this.notification(error, 'error')
      );
    },
    reset() {
      //bus.$off('MODAL_CLICK')
      sendPasswordResetEmail(auth, this.usuario).then(
        () => {
          this.notification('Enviamos un email para reestablecer su clave, revise su correo ' + this.usuario);
        },
        (error) => this.notification(error, 'error')
      );
    },
    login() {
      signInWithEmailAndPassword(auth, this.usuario, this.password).then(
        (userCredential) => {
          if (userCredential.user.emailVerified) {
            this.notification('Sesión Iniciada.');
            this.$router.replace('..');
          } else {
            this.notification(
              `Su correo <strong>${userCredential.user.email}</strong> esta registrado,
							pero no ha sido verificado.<br><br>
							Por favor revise su correo y proceda con la verificación, o presione <strong>Reenviar Verificación</strong>
							y le enviaremos un nuevo correo de verificación (esto requiere ingresar email y clave).`,
              'error',
              12000
            );
            auth.signOut();
          }
        },
        (error) => this.notification(error, 'error')
      );
    },
  },
};
</script>
<style scoped>
.form {
  max-width: 480px;
  margin: 12px auto;
}
input {
  padding: 4px;
  margin: 10px;
  border-radius: 5px;
}
</style>
