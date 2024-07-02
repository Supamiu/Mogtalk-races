import {Component, inject} from '@angular/core';
import {NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {AuthService} from "../auth.service";
import {NzModalRef} from "ng-zorro-antd/modal";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login-popup',
  standalone: true,
  imports: [
    NzFormControlComponent,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    NzInputGroupComponent,
    ReactiveFormsModule,
    NzButtonComponent
  ],
  templateUrl: './login-popup.component.html',
  styleUrl: './login-popup.component.less'
})
export class LoginPopupComponent {

  #authService = inject(AuthService);
  #ref = inject(NzModalRef, {optional: true});
  #router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  signIn(): void {
    const {email, password} = this.form.getRawValue();
    if (email && password) {
      this.#authService.loginWithEmail(email, password).subscribe(() => {
        if (this.#ref) {
          this.#ref?.close();
        } else {
          this.#router.navigateByUrl('/')
        }

      });
    }
  }

}
