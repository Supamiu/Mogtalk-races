import {Component, inject} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {RegisterPopupComponent} from "./auth/register-popup/register-popup.component";
import {filter, switchMap} from "rxjs";
import {UsersService} from "./database/users.service";
import {LoginPopupComponent} from "./auth/login-popup/login-popup.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  auth = inject(AuthService);
  #usersService = inject(UsersService);
  #dialog = inject(NzModalService);

  character$ = this.auth.user$.pipe(
    filter(Boolean),
    switchMap(user => this.#usersService.getCharacter(user.lodestoneId))
  );

  openRegisterPopup(): void {
    this.#dialog.create({
      nzContent: RegisterPopupComponent,
      nzTitle: 'Register',
      nzFooter: null
    });
  }

  openSignInPopup(): void {
    this.#dialog.create({
      nzContent: LoginPopupComponent,
      nzTitle: 'Sign In',
      nzFooter: null
    });
  }

  signOut():void{
    this.auth.signOut();
  }
}
