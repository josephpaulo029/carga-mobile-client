import { Component } from '@angular/core';
import { NavController, IonicPage, MenuController, Events, ToastController } from 'ionic-angular';
import { AuthService } from '../../providers/auth.api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [AuthService]
})
export class LoginPage {
    
    user: any = {};
    isLoading: Boolean = false;
    errorMessage: any;

    constructor(public navCtrl: NavController, 
        private storage: Storage,
        private events: Events,
        private toast: ToastController,
        private menuCtrl: MenuController,
        private authService: AuthService) {}

    login(user) {
        this.isLoading = true;
        this.authService.login(user).subscribe( data => {
            this.storage.set('authToken', data['response']).then( () => {
                this.isLoading = false;
                this.navCtrl.push('TabsPage');
                this.events.publish('loggedIn');
                this.menuCtrl.enable(true);
            });
        }, error => {
            let toast = this.toast.create({
                message: this.capitalizeFirstLetter(error.error.response),
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
            this.isLoading = false;
        })
    }

    capitalizeFirstLetter(string) {
        if(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    
        return string;
    }

    createAccount() {
        this.navCtrl.push('SignupPage');
    }

}
