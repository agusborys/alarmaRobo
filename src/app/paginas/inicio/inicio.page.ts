import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicios/auth.service';
import { NavController, Platform, AlertController } from '@ionic/angular';
import { ErrorHandlerService } from 'src/app/servicios/error-handler.service';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { timer } from 'rxjs/internal/observable/timer';
import { SpinnerHandlerService } from 'src/app/servicios/spinner-handler.service';
import { DeviceOrientation } from '@ionic-native/device-orientation/ngx';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  public message;
  public message_2;
  public active;
  //private spinner: any;
  private horizontal = true;
  private vertical = true;
  private derecha = true;
  private izquierda = true;
  private reproduciendoAudio = false;
  private analizarMovimiento: any;
  //private analizarOrientacion: any;
  public accel: string;
  public alarmaActivada = false;
  //public orientacion:number;
  private spinner:any=null;

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    public errorHand: ErrorHandlerService,
    public plt: Platform,
    private audio: NativeAudio,
    private deviceMotion: DeviceMotion,
    //private deviceOrientation:DeviceOrientation,
    private flash: Flashlight,
    private vibrator: Vibration,
    private spinnerHand:SpinnerHandlerService,
    private alertCtrl:AlertController,
  ) {
    this.active= false;
    this.horizontal=true;
    this.reproduciendoAudio = false;
   }

  ngOnInit() {
    this.alarmaActivada = false;
    this.active = false;
    this.horizontal = true;
    //this.orientacion = 0;
    this.message = 'Activar Alarma';
    this.message_2 = "";

    // Prepara los sonidos
    this.audio.preloadComplex('izquierda', 'assets/sonidos/homero_feo.mp3', 1.0, 1, 0).then(r => {
      // this.ReproducirAudio('izquierda');
    }).catch(e => { });
    this.audio.preloadComplex('derecha', 'assets/sonidos/homero_robando.mp3', 1.0, 1, 0).then(r => {
      // this.ReproducirAudio('derecha');
    }).catch(e => { });
    this.audio.preloadComplex('horizontal', 'assets/sonidos/bob_patinio.mp3', 1.0, 1, 0).then(r => {
      // this.ReproducirAudio('horizontal');
    }).catch(e => { });
    this.audio.preloadComplex('vertical', 'assets/sonidos/ringtones-march-imperial.mp3', 1.0, 1, 0).then(r => {
      // this.ReproducirAudio('vertical');
    }).catch(e => { });
  }
  public ToActivarAlarma() {
    // Si tenía la alarma activada, la desactiva, deja de escuchar los cambios en el movimiento
    // y la orientación del dispositivo y frena todos los audios que haya en curso
    if (this.active) {
      this.alarmaActivada = false;
      this.active = false;
      this.message = 'Activar Alarma';
      this.analizarMovimiento.unsubscribe();
      //this.analizarOrientacion.unsubscribe();
      this.PararSonidos();
      this.message_2 = "";
      return;
    } else {
      // Si la alarma estaba desactivada, la activa
      this.active = true;
      this.message = 'Desactivar Alarma';
      this.alarmaActivada = true;
      //this.orientacion = 0;
      this.analizarMovimiento = this.deviceMotion.watchAcceleration({ frequency: 50 })
        .subscribe((acceleration: DeviceMotionAccelerationData) => {
          this.accel = acceleration.x.toFixed(3) + ' - ' + acceleration.y.toFixed(3);
          
          if (acceleration.x > 4.0) {
            if (this.izquierda) {
              this.message_2 = "Ey! Dejá eso donde estaba!";
              this.izquierda = false;
              this.ReproducirAudio('izquierda', 1);
              timer(1000).subscribe(() => { this.izquierda = true;});
            }
          } else if (acceleration.x < -4.0) {
            if (this.derecha) {
              this.message_2 = "Fuera de aqui instruso";
              this.derecha = false;
              this.ReproducirAudio('derecha', 1);
              timer(1000).subscribe(() => { this.derecha = true;});
            }
          } else if (acceleration.x > -3.0 && acceleration.x < 3.0 && acceleration.y > 8.5) {
            if (this.vertical) {
              this.message_2 = "¿Qué estás haciendo...?";
              this.vibrator.vibrate(0);
              this.vertical = false;
              this.horizontal = false;
              this.ReproducirAudio('vertical', 5);
              this.flash.switchOn();
              timer(5000).subscribe(() => { this.flash.switchOff(); this.vertical=true;});
            }
          } else if (acceleration.x > -3.0 && acceleration.x < 3.0 && acceleration.y < 1.0 && acceleration.y > -1) {
            if (!this.horizontal) {
              this.message_2 = "Déjame donde estaba!";
              if (this.flash.isSwitchedOn()) {
                this.flash.switchOn();
              }
              this.horizontal = true;
              this.ReproducirAudio('horizontal', 5);
              this.vibrator.vibrate(5000);
            }
          }
        });
    }
  }

  public ReproducirAudio(sonido: string, delay: number) {
    this.PararSonidos();
    this.audio.play(sonido);

    if (!this.reproduciendoAudio) {

    } else {
      this.reproduciendoAudio = true;
      timer(1000 * delay).subscribe(() => {
        this.reproduciendoAudio = false;
      });
    }
  }

  public PararSonidos() {
    this.audio.stop('izquierda');
    this.audio.stop('derecha');
    this.audio.stop('vertical');
    this.audio.stop('horizontal');
  }
  //cerrar sesión
  public async LogOut() {
    const alert = await this.alertCtrl.create({
      cssClass: 'avisoAlert',
      header:'¿Desea cerrar sesión?',
      buttons:[{
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Confirm Cancel');
        }
      },
    {
      text:'Ok',
      handler: async () => {
        this.spinner = await this.spinnerHand.GetAllPageSpinner('Cerrando sesión.');
        this.spinner.present();

        timer(2000).subscribe(()=>{
          this.alarmaActivada = false;
          this.active = false;
          this.message = 'Activar Alarma';
          this.analizarMovimiento.unsubscribe();
          //this.analizarOrientacion.unsubscribe();
          this.PararSonidos();
          this.message_2 = "";
          this.authService.LogOut().then(() => {
          this.navCtrl.navigateRoot('login', { replaceUrl: true });
          }).catch(error => {
            this.errorHand.mostrarError(error);
          }).finally(() => {
            //timer(2000).subscribe(()=>this.spinner.dismiss());
            
          });
        });
      }
    }]
    });
    await alert.present();
    
    
  }

}
