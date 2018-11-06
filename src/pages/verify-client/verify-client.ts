import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController } from 'ionic-angular';
import { AccountService } from '../../providers/account.api';
import { UploadService } from '../../providers/upload.api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-verify-client',
  templateUrl: 'verify-client.html',
  providers: [AccountService, UploadService]
})
export class VerifyClientPage {

  user: any = {};
  isLoading: Boolean = false;

  constructor(private accountService: AccountService, 
    private storage: Storage,
    private navCtrl: NavController,
    private toast: ToastController,
    private uploadService: UploadService) {

  }

  ionViewWillEnter() {
    this.getUser();
  }

  viewAttachment(attachment) {
    this.navCtrl.push('ViewAttachmentPage', {
      attachment: attachment
    });
  }

  getUser() {
    this.isLoading = true;
    this.storage.get('authToken').then( token => {
      this.accountService.get(token).subscribe( user => {
          this.isLoading = false;
          this.user = user['data'];
          if(this.user.validationStatus == 'approved') {
            this.navCtrl.push('TabsPage');
          }
      });
    });
  }

  uploadAttachment(event: any): void {
    this.isLoading = true;
    this.storage.get('authToken').then(token => {
      this.getBase64(event.target.files[0]).then( data => {
        let imageData:any = data;
        let splitter = imageData.split(',');
        let image = {
            base64String: splitter[1]
        };
  
        this.uploadService.create(image, token).subscribe( data => {
            if(this.user && this.user.custom && this.user.custom.attachments) {
                this.user.custom.attachments.push(data['imageUrl']);
            } else {
                this.user.custom.attachments = [];
                this.user.custom.attachments.push(data['imageUrl']);
            }
  
            this.accountService.update(this.user, token).subscribe( data => {
                this.isLoading = false;
                let toast = this.toast.create({
                  message: 'Attachment has been uploaded',
                  duration: 3000,
                  position: 'bottom'
                });
                toast.present();
            });
        });
      });
    })
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

}